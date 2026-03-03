import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSignupSchema } from "@shared/schema";

// ─── FRED rate cache ─────────────────────────────────────────────────────────
type RateSeries = { rate: number; prev: number; trend: number[]; asOf: string; rangeLow: number; rangeHigh: number };
type RatesPayload = {
  mortgage30: RateSeries;
  treasury10: RateSeries;
  products: Array<{ label: string; rate: number; prev: number; rangeLow: number; rangeHigh: number }>;
};

let ratesCache: { data: RatesPayload; at: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchFredCsv(seriesId: string): Promise<{ values: { date: string; value: number }[] }> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n").slice(1); // skip header
  const recent = lines.slice(-35);
  const values = recent
    .map((line) => {
      const [date, val] = line.split(",");
      const value = parseFloat(val ?? "");
      return { date: (date ?? "").trim(), value };
    })
    .filter((v) => !isNaN(v.value));
  return { values };
}

function buildSeries(values: { date: string; value: number }[]): RateSeries {
  const rate = values.at(-1)?.value ?? 0;
  const prev = values.at(-2)?.value ?? rate;
  const trend = values.map((v) => v.value);
  const recent30 = values.slice(-30).map((v) => v.value);
  const rangeLow = Math.min(...recent30);
  const rangeHigh = Math.max(...recent30);
  return { rate, prev, trend, asOf: values.at(-1)?.date ?? "", rangeLow, rangeHigh };
}

function deriveProducts(base: number): RatesPayload["products"] {
  function rng(seed: number) { return ((seed * 9301 + 49297) % 233280) / 233280; }
  const spread = (label: string, delta: number, seed: number): RatesPayload["products"][0] => {
    const r = parseFloat((base + delta).toFixed(3));
    const drift = rng(seed) * 0.05 - 0.025;
    const p = parseFloat((r + drift).toFixed(3));
    const lo = parseFloat((r - 0.12 - rng(seed + 1) * 0.08).toFixed(3));
    const hi = parseFloat((r + 0.10 + rng(seed + 2) * 0.12).toFixed(3));
    return { label, rate: r, prev: p, rangeLow: lo, rangeHigh: hi };
  };
  return [
    spread("30-YR. CONFORMING", 0,      1),
    spread("30-YR. JUMBO",      +0.31,  2),
    spread("30-YR. FHA",        -0.14,  3),
    spread("30-YR. VA",         -0.24,  4),
    spread("30-YR. USDA",       -0.09,  5),
    spread("15-YR. CONFORMING", -0.66,  6),
  ];
}

async function getRates(): Promise<RatesPayload> {
  if (ratesCache && Date.now() - ratesCache.at < CACHE_TTL_MS) return ratesCache.data;
  const [m, t] = await Promise.all([
    fetchFredCsv("MORTGAGE30US"),
    fetchFredCsv("DGS10"),
  ]);
  const mortgage30 = buildSeries(m.values);
  const treasury10 = buildSeries(t.values);
  const products = deriveProducts(mortgage30.rate);
  const data: RatesPayload = { mortgage30, treasury10, products };
  ratesCache = { data, at: Date.now() };
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Live rate data from FRED (proxied to avoid CORS)
  app.get("/api/rates", async (_req, res) => {
    try {
      const data = await getRates();
      res.json(data);
    } catch (err) {
      console.error("rates fetch error", err);
      res.status(502).json({ error: "Unable to fetch live rates" });
    }
  });

  // Signup endpoint
  app.post("/api/signup", async (req, res) => {
    try {
      const signupData = insertSignupSchema.parse(req.body);
      const existingSignup = await storage.getSignupByEmail(signupData.email);
      if (existingSignup) {
        return res.status(400).json({
          message: "Email already registered. Thank you for your interest in PeraBida!",
        });
      }
      const signup = await storage.createSignup(signupData);
      res.status(201).json({
        message: "Successfully joined the waitlist! We'll notify you when PeraBida launches.",
        id: signup.id,
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({
          message: "Please check your information and try again.",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Signup statistics
  app.get("/api/signups/stats", async (_req, res) => {
    try {
      const signups = await storage.getAllSignups();
      const stats = {
        total: signups.length,
        countries: Array.from(new Set(signups.map((s) => s.country))).length,
        recentSignups: signups.filter((s) => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return s.createdAt >= dayAgo;
        }).length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ─── FDIC Bank Call API proxy ─────────────────────────────────────────────
  // Public API — no key required. Cache responses for 24 h to avoid hammering FDIC.
  const fdicCache = new Map<string, { data: unknown; at: number }>();
  const FDIC_TTL = 24 * 60 * 60 * 1000;

  async function fdicFetch(url: string, cacheKey: string): Promise<unknown> {
    const cached = fdicCache.get(cacheKey);
    if (cached && Date.now() - cached.at < FDIC_TTL) return cached.data;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`FDIC HTTP ${resp.status}`);
    const data = await resp.json();
    fdicCache.set(cacheKey, { data, at: Date.now() });
    return data;
  }

  // Fetch institution by FDIC certificate number
  // Correct FDIC BankFind Suite endpoint: api.fdic.gov/banks/institutions?filters=CERT:{n}
  app.get("/api/fdic/institution/:cert", async (req, res) => {
    const cert = parseInt(req.params.cert ?? "");
    if (isNaN(cert)) return res.status(400).json({ error: "invalid cert" });
    try {
      const url = `https://api.fdic.gov/banks/institutions?filters=CERT%3A${cert}&fields=NAME,CERT,CITY,STNAME,ASSET,CLASS,ACTIVE,REPDTE&limit=1`;
      const data = await fdicFetch(url, `cert:${cert}`);
      res.json(data);
    } catch {
      res.status(502).json({ error: "FDIC API unavailable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
