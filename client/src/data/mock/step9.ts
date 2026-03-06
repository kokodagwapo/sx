/** Cohort analysis data — derived from real loan pool (Step 9) */
// NOTE: Step 9 uses lightweight synthetic cohorts in dev mode.
// Real cohorts can be wired to `/api/loans/aggregations` + paged detail later.

type Loan = {
  source: string;
  product: string;
  state: string;
  upb: number;
  coupon: number;
  fico: number;
  ltv: number;
  dti: number;
  units: number;
  firstPaymentDate: string;
};

export type CohortDimension = "units" | "vintage" | "product" | "rateBucket" | "ltvBucket" | "geography";

export const SELLERS = ["All", "Provident", "Stonegate", "New Penn Financial"] as const;
export type Seller = typeof SELLERS[number];

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

const TOP_STATES = ["CA", "FL", "GA", "TX", "NY", "PA", "NJ", "WA", "MD", "CO"];

const MOCK_LOANS: Loan[] = (() => {
  const products = ["30 FRM", "15 FRM", "7/1 ARM", "5/1 ARM"] as const;
  const out: Loan[] = [];
  for (const seller of ["Provident", "Stonegate", "New Penn Financial"]) {
    for (const state of TOP_STATES) {
      for (const p of products) {
        const seed = (seller + state + p).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
        const count = 8 + (seed % 7);
        for (let i = 0; i < count; i++) {
          const upb = 120_000 + ((seed * (i + 3)) % 520_000);
          const coupon = 2.75 + ((seed + i) % 18) * 0.1;
          const fico = 690 + ((seed + i * 13) % 90);
          const ltv = 58 + ((seed + i * 7) % 35);
          const dti = 24 + ((seed + i * 5) % 18);
          const units = 1 + ((seed + i) % 2);
          out.push({
            source: seller,
            product: p,
            state,
            upb,
            coupon,
            fico,
            ltv,
            dti,
            units,
            firstPaymentDate: `01/01/${2014 + ((seed + i) % 3)}`,
          });
        }
      }
    }
  }
  return out;
})();

function buildCohorts<K extends string>(
  loans: Loan[],
  groupFn: (loan: Loan) => K | null,
  labels: Record<K, string>,
): CohortRow[] {
  const groups = new Map<K, { count: number; upb: number; wacSum: number; ficoSum: number; ltvSum: number; dtiSum: number }>();

  for (const loan of loans) {
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

function getVintageYear(firstPaymentDate: string): string {
  if (!firstPaymentDate) return "";
  const parts = firstPaymentDate.split("/");
  return parts.length === 3 ? parts[2].substring(0, 4) : "";
}

export const COHORT_CONFIGS: Record<CohortDimension, { title: string; description: string; labels: Record<string, string> }> = {
  units: {
    title: "By Unit Count",
    description: "Loan performance segmented by number of units in the property",
    labels: { "1": "1-Unit (SFR)", "2": "2-Unit (Duplex)", "3": "3-Unit (Triplex)", "4": "4-Unit (Fourplex)" },
  },
  vintage: {
    title: "By Origination Year",
    description: "Loan performance segmented by first payment year — real origination dates from Provident, Stonegate & New Penn Financial",
    labels: { "2014": "2014", "2015": "2015", "2016": "2016", "2026": "2026" },
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

export function getCohortData(dimension: CohortDimension, seller: Seller = "All"): CohortRow[] {
  const loans = seller === "All" ? MOCK_LOANS : MOCK_LOANS.filter((l) => l.source === seller);

  switch (dimension) {
    case "units":
      return buildCohorts(loans, (l) => {
        const u = String(l.units ?? 1);
        return ["1", "2", "3", "4"].includes(u) ? u : "1";
      }, COHORT_CONFIGS.units.labels);

    case "vintage":
      return buildCohorts(loans, (l) => {
        const yr = getVintageYear(l.firstPaymentDate);
        return yr && COHORT_CONFIGS.vintage.labels[yr] ? yr : null;
      }, COHORT_CONFIGS.vintage.labels);

    case "product":
      return buildCohorts(loans, (l) => l.product, COHORT_CONFIGS.product.labels);

    case "rateBucket":
      return buildCohorts(loans, (l) => getRateBucket(l.coupon), COHORT_CONFIGS.rateBucket.labels);

    case "ltvBucket":
      return buildCohorts(loans, (l) => getLtvBucket(l.ltv), COHORT_CONFIGS.ltvBucket.labels);

    case "geography":
      return buildCohorts(
        loans,
        (l) => TOP_STATES.includes(l.state) ? l.state : null,
        COHORT_CONFIGS.geography.labels,
      ).sort((a, b) => b.totalUpb - a.totalUpb);
  }
}
