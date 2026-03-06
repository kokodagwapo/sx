import fs from "fs";
import path from "path";

type GeoRecord = {
  id: string;
  stateFips: string;
  stateName: string;
  countyFips: string;
  countyName: string;
  city?: string;
  tractFips: string;
  tractName: string;
  loanCount: number;
  upb: number;
};

type RealStats = {
  totalLoans: number;
  totalUpb: number;
  waRate?: number;
  waLtv?: number;
  waFico?: number;
  waDti?: number;
  waPrice?: number;
  avgBalance?: number;
  byState?: Record<string, { count: number; upb: number }>;
  bySource?: Record<string, { count: number; upb: number }>;
};

type Cache<T> = { data: T; at: number };

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const loansPath = path.resolve(process.cwd(), "client/src/data/real/realLoans.json");
const geoPath = path.resolve(process.cwd(), "client/src/data/real/realGeoData.json");
const statsPath = path.resolve(process.cwd(), "client/src/data/real/realStats.json");

type LoanStatus = "Available" | "Allocated" | "Committed" | "Sold";

type RealLoanTape = {
  tvm: string;
  source?: string;
  loanAmount?: number;
  upb: number;
  rate: number;
  firstPaymentDate?: string;
  purpose?: string;
  fico: number;
  ltv: number;
  cltv?: number;
  dti: number;
  occupancy?: string;
  propertyAddress?: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  propertyType?: string;
  units?: number;
  productType?: string;
  term?: number;
  lienPosition?: string;
  status?: string;
  buyerId?: string;
  // pricing fields may exist; ignore for list responses unless needed
};

type LoanNormalized = {
  id: string; // tvm
  tvm: string;
  source: string;
  productType: string;
  purpose: "Purchase" | "Refinance";
  occupancy: "Owner" | "Investment" | "Second home";
  propertyType: string;
  loanType: "ARM" | "Conventional";
  state: string;
  county: string;
  city: string;
  upb: number;
  loanAmount: number;
  rate: number;
  interestRateBucket: string;
  duration: number;
  status: LoanStatus;
  units: number;
  dti: number;
  ltv: number;
  cltv: number;
  fico: number;
  firstPaymentDate: string;
  lienPosition: string;
  propertyAddress: string;
  term: number;
  buyerId?: string;
};

let loansCache: Cache<LoanNormalized[]> | null = null;
let geoCache: Cache<GeoRecord[]> | null = null;
let statsCache: Cache<RealStats> | null = null;

function fresh<T>(c: Cache<T> | null) {
  return c && Date.now() - c.at < CACHE_TTL_MS;
}

function safeReadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

export function getPortfolioStats(): RealStats | null {
  try {
    if (fresh(statsCache)) return statsCache!.data;
    const data = safeReadJson<RealStats>(statsPath);
    statsCache = { data, at: Date.now() };
    return data;
  } catch {
    return null;
  }
}

export function getGeoRecords(): GeoRecord[] {
  if (fresh(geoCache)) return geoCache!.data;
  const data = safeReadJson<GeoRecord[]>(geoPath);
  geoCache = { data, at: Date.now() };
  return data;
}

function getRateBucket(rate: number): string {
  if (rate < 3) return "< 3";
  if (rate < 3.5) return "3–3.5";
  if (rate < 4) return "3.5–4";
  if (rate < 4.5) return "4–4.5";
  if (rate < 5) return "4.5–5";
  if (rate < 5.5) return "5–5.5";
  return "5.5+";
}

function normalizeOccupancy(occ?: string): LoanNormalized["occupancy"] {
  if (occ === "Investment") return "Investment";
  if (occ === "Second Home") return "Second home";
  if (occ === "Second home") return "Second home";
  return "Owner";
}

function normalizePurpose(p?: string): LoanNormalized["purpose"] {
  return p === "Purchase" ? "Purchase" : "Refinance";
}

function normalizeStatus(s?: string): LoanStatus {
  if (s === "Allocated" || s === "Committed" || s === "Sold") return s;
  return "Available";
}

function normalizeLoanType(productType: string): LoanNormalized["loanType"] {
  return productType === "5/1 ARM" || productType === "7/1 ARM" ? "ARM" : "Conventional";
}

function seeded01(seed: string): number {
  // Tiny deterministic hash -> [0,1)
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

function estimateDuration(termMonths: number, rate: number, seed: string): number {
  const years = termMonths / 12;
  const jitter = seeded01(seed) * 0.8; // <= 0.8y
  const base = years <= 15 ? 4 + rate * 0.3 : 6 + rate * 0.4;
  return Math.round((base + jitter) * 100) / 100;
}

export function getLoans(): LoanNormalized[] {
  if (fresh(loansCache)) return loansCache!.data;
  const raw = safeReadJson<RealLoanTape[]>(loansPath);
  const data: LoanNormalized[] = raw
    .filter((r) => r && typeof r.tvm === "string" && typeof r.upb === "number" && typeof r.rate === "number")
    .map((r) => {
      const tvm = r.tvm;
      const productType = r.productType ?? "30 FRM";
      const term = r.term ?? (productType === "15 FRM" ? 180 : 360);
      const rate = r.rate;
      return {
        id: tvm,
        tvm,
        source: r.source ?? "Unknown",
        productType,
        purpose: normalizePurpose(r.purpose),
        occupancy: normalizeOccupancy(r.occupancy),
        propertyType: r.propertyType ?? "Single-family",
        loanType: normalizeLoanType(productType),
        state: r.state ?? "",
        county: r.county ?? "",
        city: r.city ?? "",
        upb: r.upb,
        loanAmount: r.loanAmount ?? r.upb,
        rate,
        interestRateBucket: getRateBucket(rate),
        duration: estimateDuration(term, rate, tvm),
        status: normalizeStatus(r.status),
        units: r.units ?? 1,
        dti: r.dti,
        ltv: r.ltv,
        cltv: (r as any).cltv ?? r.ltv,
        fico: r.fico,
        firstPaymentDate: r.firstPaymentDate ?? "",
        lienPosition: r.lienPosition ?? "1st",
        propertyAddress: r.propertyAddress ?? "",
        term,
        buyerId: r.buyerId,
      };
    });

  loansCache = { data, at: Date.now() };
  return data;
}

export type LoanListItem = {
  id: string;
  tvm: string;
  source: string;
  productType: string;
  loanType: string;
  interestRateBucket: string;
  occupancy: string;
  purpose: string;
  propertyType: string;
  state: string;
  county: string;
  city: string;
  upb: number;
  loanAmount: number;
  rate: number;
  duration: number;
  status: string;
  units: number;
  dti: number;
  ltv: number;
  cltv: number;
  fico: number;
  firstPaymentDate: string;
  lienPosition: string;
  propertyAddress: string;
  term: number;
  buyerId?: string;
};

export type LoanSearchParams = {
  q?: string;
  limit: number;
  cursor?: string;
  sort?: string; // e.g. "upb:desc"
  filters?: Record<string, string[]>;
  /** Numeric ranges: field -> list of inclusive [min,max] ranges (OR within field) */
  ranges?: Record<string, Array<[number, number]>>;
};

function includesInsensitive(haystack: unknown, needle: string) {
  if (!needle) return true;
  const s = String(haystack ?? "").toLowerCase();
  return s.includes(needle);
}

function filterLoans(loans: LoanNormalized[], params: LoanSearchParams): LoanNormalized[] {
  const q = (params.q ?? "").trim().toLowerCase();
  const filters = params.filters ?? {};
  const ranges = params.ranges ?? {};

  return loans.filter((l) => {
    if (q) {
      const hit =
        includesInsensitive(l.id, q) ||
        includesInsensitive(l.state, q) ||
        includesInsensitive(l.county, q) ||
        includesInsensitive(l.city, q) ||
        includesInsensitive(l.source, q) ||
        includesInsensitive(l.productType, q);
      if (!hit) return false;
    }

    // Multi-select filters
    for (const [key, values] of Object.entries(filters)) {
      if (!values?.length) continue;
      const v = String((l as any)[key] ?? "");
      if (!values.includes(v)) return false;
    }

    // Numeric range filters (e.g. rate/upb/dti/ltv/fico)
    for (const [key, list] of Object.entries(ranges)) {
      if (!list?.length) continue;
      const raw = (l as any)[key];
      const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      if (!Number.isFinite(n)) return false;
      const ok = list.some(([min, max]) => n >= min && n <= max);
      if (!ok) return false;
    }

    return true;
  });
}

function sortLoans(loans: LoanNormalized[], sort?: string): LoanNormalized[] {
  if (!sort) return loans;
  const [field, dir] = sort.split(":");
  const sign = dir === "asc" ? 1 : -1;
  const key = (field ?? "").trim();
  if (!key) return loans;

  return [...loans].sort((a: any, b: any) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
    return String(av).localeCompare(String(bv)) * sign;
  });
}

function encodeCursor(offset: number) {
  return Buffer.from(String(offset), "utf8").toString("base64");
}

function decodeCursor(cursor?: string) {
  if (!cursor) return 0;
  try {
    const s = Buffer.from(cursor, "base64").toString("utf8");
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function searchLoans(params: LoanSearchParams): {
  items: LoanListItem[];
  nextCursor: string | null;
  total: number;
} {
  const all = getLoans();
  const filtered = filterLoans(all, params);
  const sorted = sortLoans(filtered, params.sort);
  const total = sorted.length;

  const limit = Math.max(1, Math.min(200, params.limit || 50));
  const offset = decodeCursor(params.cursor);

  const page = sorted.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const nextCursor = nextOffset < total ? encodeCursor(nextOffset) : null;

  const items = page.map((l) => ({
    id: l.id,
    tvm: l.tvm,
    source: l.source,
    productType: l.productType,
    loanType: l.loanType,
    interestRateBucket: l.interestRateBucket,
    occupancy: l.occupancy,
    purpose: l.purpose,
    propertyType: l.propertyType,
    state: l.state,
    county: l.county,
    city: l.city,
    upb: l.upb,
    loanAmount: l.loanAmount,
    rate: l.rate,
    duration: l.duration,
    status: l.status,
    units: l.units,
    dti: l.dti,
    ltv: l.ltv,
    cltv: l.cltv,
    fico: l.fico,
    firstPaymentDate: l.firstPaymentDate,
    lienPosition: l.lienPosition,
    propertyAddress: l.propertyAddress,
    term: l.term,
    buyerId: l.buyerId,
  }));

  return { items, nextCursor, total };
}

export function getLoanById(id: string): LoanNormalized | null {
  const q = id.trim();
  if (!q) return null;
  const loans = getLoans();
  return loans.find((l) => l.id === q || l.tvm === q) ?? null;
}

export function aggregateLoans(params: Omit<LoanSearchParams, "cursor" | "limit">): {
  total: number;
  totalUpb: number;
  wac: number;
  wad: number;
  waFico: number;
  waLtv: number;
  waDti: number;
  avgBalance: number;
  byStatus: Record<string, { count: number; upb: number }>;
  byInterestRateBucket: Record<string, number>;
  byState: Record<string, number>;
  byProductType: Record<string, number>;
  byPurpose: Record<string, number>;
  byLoanType: Record<string, number>;
} {
  const all = getLoans();
  const filtered = filterLoans(all, { ...params, limit: 1 });

  let totalUpb = 0;
  let sumRateUpb = 0;
  let sumDurUpb = 0;
  let sumFicoUpb = 0;
  let sumLtvUpb = 0;
  let sumDtiUpb = 0;
  const byStatus: Record<string, { count: number; upb: number }> = {};
  const byInterestRateBucket: Record<string, number> = {};
  const byState: Record<string, number> = {};
  const byProductType: Record<string, number> = {};
  const byPurpose: Record<string, number> = {};
  const byLoanType: Record<string, number> = {};

  for (const l of filtered) {
    totalUpb += l.upb;
    sumRateUpb += l.rate * l.upb;
    sumDurUpb += l.duration * l.upb;
    sumFicoUpb += l.fico * l.upb;
    sumLtvUpb += l.ltv * l.upb;
    sumDtiUpb += l.dti * l.upb;

    byStatus[l.status] = byStatus[l.status] ?? { count: 0, upb: 0 };
    byStatus[l.status].count += 1;
    byStatus[l.status].upb += l.upb;

    byInterestRateBucket[l.interestRateBucket] = (byInterestRateBucket[l.interestRateBucket] ?? 0) + 1;
    byState[l.state] = (byState[l.state] ?? 0) + 1;
    byProductType[l.productType] = (byProductType[l.productType] ?? 0) + 1;
    byPurpose[l.purpose] = (byPurpose[l.purpose] ?? 0) + 1;
    byLoanType[l.loanType] = (byLoanType[l.loanType] ?? 0) + 1;
  }

  const total = filtered.length;
  const wac = totalUpb ? sumRateUpb / totalUpb : 0;
  const wad = totalUpb ? sumDurUpb / totalUpb : 0;
  const waFico = totalUpb ? sumFicoUpb / totalUpb : 0;
  const waLtv = totalUpb ? sumLtvUpb / totalUpb : 0;
  const waDti = totalUpb ? sumDtiUpb / totalUpb : 0;
  const avgBalance = total ? totalUpb / total : 0;

  return {
    total,
    totalUpb,
    wac,
    wad,
    waFico,
    waLtv,
    waDti,
    avgBalance,
    byStatus,
    byInterestRateBucket,
    byState,
    byProductType,
    byPurpose,
    byLoanType,
  };
}

export function getFilteredLoans(params: Omit<LoanSearchParams, "cursor" | "limit">): LoanNormalized[] {
  const all = getLoans();
  return filterLoans(all, { ...params, limit: 1 });
}

