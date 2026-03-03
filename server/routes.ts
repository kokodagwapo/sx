import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { insertSignupSchema } from "@shared/schema";

const statsPath = path.resolve(process.cwd(), "client/src/data/real/realStats.json");
const PORTFOLIO_STATS = (() => {
  try { return JSON.parse(fs.readFileSync(statsPath, "utf-8")); } catch { return null; }
})();

const COHI_CONTEXT = {
  portfolio: { totalLoans: 7052, totalUpb: 1861333635, waRate: 3.5034, waFico: 744, waLtv: 71.42, waDti: 35.56 },
  bySource: {
    Provident:           { count: 2452, upb: 711354965,  waRate: 3.2781, waFico: 769, waLtv: 61.16, waDti: 31.27 },
    Stonegate:           { count: 963,  upb: 209093793,  waRate: 3.7413, waFico: 716, waLtv: 87.87, waDti: 39.21 },
    "New Penn Financial":{ count: 3637, upb: 940884877,  waRate: 3.621,  waFico: 732, waLtv: 75.52, waDti: 38.00 },
  },
  topStates: { CA: 1449, FL: 422, GA: 392, PA: 378, TX: 355 },
  products: { "30FRM": 5507, "15FRM": 1451, "7/1 ARM": 44, "5/1 ARM": 50 },
  status: { Available: 3849, Allocated: 1483, Committed: 898, Sold: 822 },
};

function cohiFallback(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("provident"))
    return "Provident has 2,452 loans totaling $711M UPB with a WA Rate of 3.28%, WA FICO of 769, and WA LTV of 61.16%. It is the highest credit quality seller in the portfolio.";
  if (q.includes("stonegate"))
    return "Stonegate has 963 loans totaling $209M UPB with a WA Rate of 3.74%, WA FICO of 716, and WA LTV of 87.87%. It has the highest LTV among the three sellers.";
  if (q.includes("new penn") || q.includes("penn financial"))
    return "New Penn Financial has 3,637 loans totaling $941M UPB with a WA Rate of 3.62%, WA FICO of 732, and WA LTV of 75.52%. It is the largest seller by both loan count and UPB.";
  if (q.includes("fico") || q.includes("credit score"))
    return "The portfolio WA FICO is 744. By seller: Provident leads at 769, New Penn Financial at 732, and Stonegate at 716.";
  if (q.includes("ltv") || q.includes("loan-to-value") || q.includes("loan to value"))
    return "The portfolio WA LTV is 71.42%. Provident has the lowest LTV at 61.16%, New Penn Financial at 75.52%, and Stonegate at 87.87%.";
  if (q.includes("rate") || q.includes("coupon") || q.includes("interest"))
    return "The portfolio WA Rate is 3.50%. By seller: Provident 3.28%, New Penn Financial 3.62%, Stonegate 3.74%.";
  if (q.includes("upb") || q.includes("balance") || q.includes("size") || q.includes("portfolio"))
    return "Total portfolio UPB is $1.86B across 7,052 loans. New Penn Financial leads at $941M (50.6%), Provident at $711M (38.2%), and Stonegate at $209M (11.2%).";
  if (q.includes("state") || q.includes("california") || q.includes("florida") || q.includes("georgia"))
    return "Top states by loan count: California (1,449), Florida (422), Georgia (392), Pennsylvania (378), and Texas (355).";
  if (q.includes("product") || q.includes("30yr") || q.includes("15yr") || q.includes("arm") || q.includes("fixed"))
    return "Product mix: 30-year Fixed (78.1%, 5,507 loans), 15-year Fixed (20.6%, 1,451 loans), ARMs (1.3%, 94 loans).";
  if (q.includes("available") || q.includes("status") || q.includes("sold") || q.includes("allocated"))
    return "Portfolio status: Available 3,849 loans (54.6%), Allocated 1,483 (21.0%), Committed 898 (12.7%), Sold 822 (11.7%).";
  if (q.includes("dti") || q.includes("debt") || q.includes("income"))
    return "The portfolio WA DTI is 35.56%. Provident borrowers have the lowest DTI at 31.27%, New Penn at 38.00%, and Stonegate at 39.21%.";
  return `The SprinkleX portfolio contains 7,052 loans totaling $1.86B UPB across three sellers: New Penn Financial ($941M), Provident ($711M), and Stonegate ($209M). WA FICO is 744, WA Rate is 3.50%, WA LTV is 71.42%.`;
}

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

  // Search institutions by name (for Bank Call Report page)
  app.get("/api/fdic/search", async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });
    try {
      const encoded = encodeURIComponent(q);
      const url = `https://api.fdic.gov/banks/institutions?search=${encoded}&fields=NAME,CERT,CITY,STNAME,ASSET,CLASS,ACTIVE,REPDTE,NETINC,INTINC,NONII,LNLSNET,DEP,EQ,ROA,ROE&limit=25&sort_by=ASSET&sort_order=DESC`;
      const data = await fdicFetch(url, `search:${q.toLowerCase()}`);
      res.json(data);
    } catch {
      res.status(502).json({ error: "FDIC API unavailable" });
    }
  });

  // Fetch full call report by cert (extended fields)
  app.get("/api/fdic/report/:cert", async (req, res) => {
    const cert = parseInt(req.params.cert ?? "");
    if (isNaN(cert)) return res.status(400).json({ error: "invalid cert" });
    try {
      const url = `https://api.fdic.gov/banks/institutions?filters=CERT%3A${cert}&fields=NAME,CERT,CITY,STNAME,ASSET,CLASS,ACTIVE,REPDTE,NETINC,INTINC,NONII,LNLSNET,DEP,EQ,ROA,ROE,NAMEHCR,SPECGRP&limit=1`;
      const data = await fdicFetch(url, `report:${cert}`);
      res.json(data);
    } catch {
      res.status(502).json({ error: "FDIC API unavailable" });
    }
  });

  // ─── Cohi AI chat ─────────────────────────────────────────────────────────
  app.post("/api/cohi/chat", async (req, res) => {
    const { query } = req.body as { query?: string };
    if (!query || typeof query !== "string") return res.status(400).json({ error: "query is required" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are Cohi, an AI analyst for the SprinkleX mortgage loan portfolio platform. Answer questions factually using only the provided portfolio data. Be concise (2–4 sentences max). Format numbers clearly.\n\nPortfolio data:\n${JSON.stringify(COHI_CONTEXT)}`,
            },
            { role: "user", content: query },
          ],
          max_tokens: 220,
        }, { signal: AbortSignal.timeout(30000) });
        const answer = completion.choices[0]?.message?.content ?? cohiFallback(query);
        return res.json({ answer });
      } catch (err) {
        console.error("Cohi OpenAI error:", err);
      }
    }
    res.json({ answer: cohiFallback(query) });
  });

  const httpServer = createServer(app);
  return httpServer;
}
