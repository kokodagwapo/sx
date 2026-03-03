/** Cohort analysis data — derived from the loan pool (Step 9) */
import { step2Loans } from "./step2Loans";

export type CohortDimension = "units" | "vintage" | "product" | "rateBucket" | "ltvBucket" | "geography";

export type CohortRow = {
  label: string;
  loanCount: number;
  totalUpb: number;
  avgBalance: number;
  wac: number;
  avgFico: number;
  avgLtv: number;
  avgDti: number;
};

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const rng = seededRandom(99999);

function mkFico() { return Math.round(620 + rng() * 200); }
function mkLtv() { return Math.round((55 + rng() * 40) * 10) / 10; }
function mkDti() { return Math.round((20 + rng() * 25) * 10) / 10; }

function buildCohorts<K extends string>(
  groupFn: (loan: typeof step2Loans[0]) => K,
  labels: Record<K, string>,
): CohortRow[] {
  const groups = new Map<K, { count: number; upb: number; couponSum: number; ficoSum: number; ltvSum: number; dtiSum: number }>();

  for (const loan of step2Loans) {
    const key = groupFn(loan);
    if (!labels[key]) continue;
    const existing = groups.get(key);
    const coupon = loan.coupon;
    const fico = mkFico();
    const ltv = mkLtv();
    const dti = mkDti();
    if (existing) {
      existing.count++;
      existing.upb += loan.upb;
      existing.couponSum += coupon * loan.upb;
      existing.ficoSum += fico;
      existing.ltvSum += ltv;
      existing.dtiSum += dti;
    } else {
      groups.set(key, { count: 1, upb: loan.upb, couponSum: coupon * loan.upb, ficoSum: fico, ltvSum: ltv, dtiSum: dti });
    }
  }

  return Object.entries(labels).map(([key, label]) => {
    const g = groups.get(key as K);
    if (!g || g.count === 0) {
      return { label: label as string, loanCount: 0, totalUpb: 0, avgBalance: 0, wac: 0, avgFico: 0, avgLtv: 0, avgDti: 0 };
    }
    return {
      label: label as string,
      loanCount: g.count,
      totalUpb: g.upb,
      avgBalance: Math.round(g.upb / g.count),
      wac: Math.round((g.couponSum / g.upb) * 1000) / 1000,
      avgFico: Math.round(g.ficoSum / g.count),
      avgLtv: Math.round((g.ltvSum / g.count) * 10) / 10,
      avgDti: Math.round((g.dtiSum / g.count) * 10) / 10,
    };
  }).filter(r => r.loanCount > 0);
}

function getUnitKey(loan: typeof step2Loans[0]): string {
  return String(loan.units ?? 1);
}

function getVintageKey(): string {
  const years = ["2020", "2021", "2022", "2023", "2024"];
  return years[Math.floor(rng() * years.length)];
}

const loanVintages = step2Loans.map(() => getVintageKey());

function getRateBucket(coupon: number): string {
  if (coupon < 3) return "2–3%";
  if (coupon < 4) return "3–4%";
  if (coupon < 5) return "4–5%";
  if (coupon < 6) return "5–6%";
  return "6%+";
}

function getLtvBucket(loan: typeof step2Loans[0]): string {
  const ltvRaw = mkLtv();
  if (ltvRaw < 60) return "<60%";
  if (ltvRaw < 70) return "60–70%";
  if (ltvRaw < 80) return "70–80%";
  if (ltvRaw < 90) return "80–90%";
  return ">90%";
}

const TOP_STATES = ["CA", "FL", "GA", "TX", "NC", "VA", "SC", "NY", "PA", "WA"];

export const COHORT_CONFIGS: Record<CohortDimension, { title: string; description: string; labels: Record<string, string> }> = {
  units: {
    title: "By Unit Count",
    description: "Loan performance segmented by number of units in the property",
    labels: { "1": "1-Unit (SFR)", "2": "2-Unit (Duplex)", "3": "3-Unit (Triplex)", "4": "4-Unit (Fourplex)" },
  },
  vintage: {
    title: "By Origination Vintage",
    description: "Loan performance segmented by origination year",
    labels: { "2020": "2020", "2021": "2021", "2022": "2022", "2023": "2023", "2024": "2024" },
  },
  product: {
    title: "By Product Type",
    description: "Loan performance segmented by mortgage product",
    labels: { "30 FRM": "30 FRM", "15 FRM": "15 FRM", "7/1 ARM": "7/1 ARM", "5/1 ARM": "5/1 ARM" },
  },
  rateBucket: {
    title: "By Rate Bucket",
    description: "Loan performance segmented by interest rate range",
    labels: { "2–3%": "2–3%", "3–4%": "3–4%", "4–5%": "4–5%", "5–6%": "5–6%", "6%+": "6%+" },
  },
  ltvBucket: {
    title: "By LTV Bucket",
    description: "Loan performance segmented by loan-to-value ratio",
    labels: { "<60%": "<60%", "60–70%": "60–70%", "70–80%": "70–80%", "80–90%": "80–90%", ">90%": ">90%" },
  },
  geography: {
    title: "By State (Top 10)",
    description: "Loan performance segmented by top 10 states by volume",
    labels: Object.fromEntries(TOP_STATES.map(s => [s, s])),
  },
};

function buildUnitCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => String(loan.units ?? 1),
    COHORT_CONFIGS.units.labels,
  );
}

function buildVintageCohorts(): CohortRow[] {
  return step2Loans.reduce((acc, loan, i) => {
    const vintage = loanVintages[i];
    const existing = acc.find(r => r.label === vintage);
    const fakeFico = 620 + Math.floor((loan.upb % 200));
    const fakeLtv = 55 + (loan.upb % 40);
    const fakeDti = 20 + (loan.coupon * 3 % 25);
    if (existing) {
      existing.loanCount++;
      existing.totalUpb += loan.upb;
      existing.wac = (existing.wac * (existing.loanCount - 1) * existing.totalUpb + loan.coupon * loan.upb) / existing.totalUpb;
      existing.avgFico = Math.round((existing.avgFico * (existing.loanCount - 1) + fakeFico) / existing.loanCount);
      existing.avgLtv = Math.round(((existing.avgLtv * (existing.loanCount - 1) + fakeLtv) / existing.loanCount) * 10) / 10;
      existing.avgDti = Math.round(((existing.avgDti * (existing.loanCount - 1) + fakeDti) / existing.loanCount) * 10) / 10;
      existing.avgBalance = Math.round(existing.totalUpb / existing.loanCount);
    } else {
      acc.push({
        label: vintage,
        loanCount: 1,
        totalUpb: loan.upb,
        avgBalance: loan.upb,
        wac: loan.coupon,
        avgFico: fakeFico,
        avgLtv: Math.round(fakeLtv * 10) / 10,
        avgDti: Math.round(fakeDti * 10) / 10,
      });
    }
    return acc;
  }, [] as CohortRow[]).sort((a, b) => a.label.localeCompare(b.label));
}

function buildProductCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => loan.product,
    COHORT_CONFIGS.product.labels,
  );
}

function buildRateCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => getRateBucket(loan.coupon),
    COHORT_CONFIGS.rateBucket.labels,
  );
}

function buildLtvCohorts(): CohortRow[] {
  const buckets: Record<string, CohortRow> = {};
  const keys = Object.keys(COHORT_CONFIGS.ltvBucket.labels);
  for (const k of keys) {
    buckets[k] = { label: k, loanCount: 0, totalUpb: 0, avgBalance: 0, wac: 0, avgFico: 0, avgLtv: 0, avgDti: 0 };
  }
  for (const loan of step2Loans) {
    const bucket = getLtvBucket(loan);
    const b = buckets[bucket];
    if (!b) continue;
    b.loanCount++;
    b.totalUpb += loan.upb;
    b.wac = b.wac === 0 ? loan.coupon : (b.wac * (b.loanCount - 1) + loan.coupon) / b.loanCount;
    b.avgFico = Math.round((b.avgFico * (b.loanCount - 1) + mkFico()) / b.loanCount);
    const lv = mkLtv();
    b.avgLtv = Math.round(((b.avgLtv * (b.loanCount - 1) + lv) / b.loanCount) * 10) / 10;
    b.avgDti = Math.round(((b.avgDti * (b.loanCount - 1) + mkDti()) / b.loanCount) * 10) / 10;
  }
  for (const b of Object.values(buckets)) {
    b.avgBalance = b.loanCount > 0 ? Math.round(b.totalUpb / b.loanCount) : 0;
    b.wac = Math.round(b.wac * 1000) / 1000;
  }
  return keys.map(k => buckets[k]).filter(b => b.loanCount > 0);
}

function buildGeoCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => loan.state,
    COHORT_CONFIGS.geography.labels,
  ).sort((a, b) => b.totalUpb - a.totalUpb);
}

export function getCohortData(dimension: CohortDimension): CohortRow[] {
  switch (dimension) {
    case "units": return buildUnitCohorts();
    case "vintage": return buildVintageCohorts();
    case "product": return buildProductCohorts();
    case "rateBucket": return buildRateCohorts();
    case "ltvBucket": return buildLtvCohorts();
    case "geography": return buildGeoCohorts();
  }
}
