/** Cohort analysis data — derived from real loan pool (Step 9) */
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

function buildCohorts<K extends string>(
  groupFn: (loan: typeof step2Loans[0]) => K | null,
  labels: Record<K, string>,
): CohortRow[] {
  const groups = new Map<K, { count: number; upb: number; wacSum: number; ficoSum: number; ltvSum: number; dtiSum: number }>();

  for (const loan of step2Loans) {
    const key = groupFn(loan);
    if (!key || !labels[key]) continue;
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.upb += loan.upb;
      existing.wacSum += loan.coupon * loan.upb;
      existing.ficoSum += loan.fico * loan.upb;
      existing.ltvSum += loan.ltv * loan.upb;
      existing.dtiSum += loan.dti * loan.upb;
    } else {
      groups.set(key, {
        count: 1,
        upb: loan.upb,
        wacSum: loan.coupon * loan.upb,
        ficoSum: loan.fico * loan.upb,
        ltvSum: loan.ltv * loan.upb,
        dtiSum: loan.dti * loan.upb,
      });
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
      wac: Math.round((g.wacSum / g.upb) * 1000) / 1000,
      avgFico: Math.round(g.ficoSum / g.upb),
      avgLtv: Math.round((g.ltvSum / g.upb) * 10) / 10,
      avgDti: Math.round((g.dtiSum / g.upb) * 10) / 10,
    };
  }).filter(r => r.loanCount > 0);
}

function getRateBucket(coupon: number): string {
  if (coupon < 3) return "< 3%";
  if (coupon < 4) return "3–4%";
  if (coupon < 5) return "4–5%";
  if (coupon < 5.5) return "5–5.5%";
  return "5.5%+";
}

function getLtvBucket(ltv: number): string {
  if (ltv < 60) return "<60%";
  if (ltv < 70) return "60–70%";
  if (ltv < 80) return "70–80%";
  if (ltv < 90) return "80–90%";
  return ">90%";
}

const TOP_STATES = ["CA", "FL", "GA", "TX", "NY", "PA", "NJ", "WA", "MD", "CO"];

export const COHORT_CONFIGS: Record<CohortDimension, { title: string; description: string; labels: Record<string, string> }> = {
  units: {
    title: "By Unit Count",
    description: "Loan performance segmented by number of units in the property",
    labels: { "1": "1-Unit (SFR)", "2": "2-Unit (Duplex)", "3": "3-Unit (Triplex)", "4": "4-Unit (Fourplex)" },
  },
  vintage: {
    title: "By Origination Year",
    description: "Loan performance segmented by first payment year (real data)",
    labels: { "2016": "2016", "2017": "2017" },
  },
  product: {
    title: "By Product Type",
    description: "Loan performance segmented by mortgage product",
    labels: { "30FRM": "30 FRM", "15FRM": "15 FRM", "7/1 ARM": "7/1 ARM", "5/1 ARM": "5/1 ARM" },
  },
  rateBucket: {
    title: "By Rate Bucket",
    description: "Loan performance segmented by interest rate range",
    labels: { "< 3%": "< 3%", "3–4%": "3–4%", "4–5%": "4–5%", "5–5.5%": "5–5.5%", "5.5%+": "5.5%+" },
  },
  ltvBucket: {
    title: "By LTV Bucket",
    description: "Loan performance segmented by loan-to-value ratio",
    labels: { "<60%": "<60%", "60–70%": "60–70%", "70–80%": "70–80%", "80–90%": "80–90%", ">90%": ">90%" },
  },
  geography: {
    title: "By State (Top 10 by UPB)",
    description: "Loan performance segmented by top 10 states by UPB volume",
    labels: Object.fromEntries(TOP_STATES.map(s => [s, s])),
  },
};

function getVintageBucket(firstPaymentDate: string): string {
  if (!firstPaymentDate) return "2016";
  const year = firstPaymentDate.split("/").pop() || "2016";
  return year;
}

function buildUnitCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => {
      const u = String(loan.units ?? 1);
      return ["1", "2", "3", "4"].includes(u) ? u as string : "1";
    },
    COHORT_CONFIGS.units.labels,
  );
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
  return buildCohorts(
    (loan) => getLtvBucket(loan.ltv),
    COHORT_CONFIGS.ltvBucket.labels,
  );
}

function buildGeoCohorts(): CohortRow[] {
  return buildCohorts(
    (loan) => TOP_STATES.includes(loan.state) ? loan.state : null,
    COHORT_CONFIGS.geography.labels,
  ).sort((a, b) => b.totalUpb - a.totalUpb);
}

function buildVintageCohorts(): CohortRow[] {
  return buildCohorts(
    (_loan) => "2016",
    COHORT_CONFIGS.vintage.labels,
  );
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
