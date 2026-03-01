import type { DonutDatum } from "@/components/charts/DonutChart";

export const step8ProductType: DonutDatum[] = [
  { name: "30 FRM", value: 85.2, color: "#991b1b" },
  { name: "15 FRM", value: 12.6, color: "#2563eb" },
  { name: "7/1 ARM", value: 2.2, color: "#60a5fa" },
];

export const step8Occupancy: DonutDatum[] = [
  { name: "Owner", value: 92.6, color: "#991b1b" },
  { name: "Investment", value: 4.9, color: "#2563eb" },
  { name: "Other", value: 2.5, color: "#60a5fa" },
];

export const step8Purpose: DonutDatum[] = [
  { name: "Purchase", value: 55.2, color: "#991b1b" },
  { name: "Refinance", value: 44.8, color: "#2563eb" },
];

export const step8States: DonutDatum[] = [
  { name: "CA", value: 10.8, color: "#991b1b" },
  { name: "FL", value: 10.1, color: "#b91c1c" },
  { name: "GA", value: 9.6, color: "#dc2626" },
  { name: "PA", value: 7.1, color: "#ea580c" },
  { name: "NY", value: 4.5, color: "#2563eb" },
  { name: "MD", value: 3.3, color: "#3b82f6" },
  { name: "MA", value: 2.8, color: "#60a5fa" },
  { name: "NJ", value: 2.4, color: "#7dd3fc" },
  { name: "VA", value: 1.9, color: "#93c5fd" },
  { name: "Other", value: 47.5, color: "#94a3b8" },
];

export type WacByProductDatum = {
  name: string;
  loans: number;
  wac: number;
};

export const step8WacByProduct: WacByProductDatum[] = [
  { name: "5/1 ARM", loans: 420, wac: 3.25 },
  { name: "7/1 ARM", loans: 890, wac: 3.55 },
  { name: "10/1 ARM", loans: 650, wac: 3.72 },
  { name: "15 FRM", loans: 792, wac: 3.85 },
  { name: "30 FRM", loans: 5361, wac: 4.28 },
];

export type LoanTermRow = {
  term: string;
  loans: number;
  totalAmount: number;
  wpi: number;
};

export const step8LoanTerms: LoanTermRow[] = [
  { term: "ARM", loans: 81, totalAmount: 26_148_927, wpi: 100.65 },
  { term: "120", loans: 126, totalAmount: 21_672_858, wpi: 101.61 },
  { term: "144", loans: 2, totalAmount: 1_672_858, wpi: 101.10 },
  { term: "156", loans: 1, totalAmount: 175_700, wpi: 102.25 },
  { term: "180", loans: 667, totalAmount: 139_033_977, wpi: 104.52 },
  { term: "204", loans: 1, totalAmount: 260_000, wpi: 101.80 },
  { term: "216", loans: 3, totalAmount: 730_905, wpi: 102.12 },
  { term: "228", loans: 3, totalAmount: 260_000, wpi: 101.00 },
  { term: "240", loans: 218, totalAmount: 39_661_355, wpi: 101.72 },
  { term: "252", loans: 3, totalAmount: 351_472, wpi: 103.40 },
  { term: "264", loans: 3, totalAmount: 628_866, wpi: 103.41 },
  { term: "276", loans: 3, totalAmount: 551_652, wpi: 104.20 },
];

export type CompositionDrilldown = {
  segment: string;
  definition: string;
  pct: number;
  insights: string[];
};

export const step8CompositionDrilldown: Record<string, Record<string, CompositionDrilldown>> = {
  productType: {
    "30 FRM": {
      segment: "30 FRM",
      definition: "30-year fixed-rate mortgage.",
      pct: 85.2,
      insights: ["Dominant product; drives portfolio WAC.", "Highest volume in loan term table."],
    },
    "15 FRM": {
      segment: "15 FRM",
      definition: "15-year fixed-rate mortgage.",
      pct: 12.6,
      insights: ["Shorter tenure; typically lower LTV.", "Higher WAC than ARMs."],
    },
    "7/1 ARM": {
      segment: "7/1 ARM",
      definition: "7-year adjustable-rate mortgage.",
      pct: 2.2,
      insights: ["Smaller share; rate-sensitive."],
    },
  },
  occupancy: {
    Owner: {
      segment: "Owner",
      definition: "Owner-occupied property.",
      pct: 92.6,
      insights: ["Primary residence; typically stronger credit."],
    },
    Investment: {
      segment: "Investment",
      definition: "Investment property.",
      pct: 4.9,
      insights: ["Non-owner; may have different risk profile."],
    },
  },
  purpose: {
    Purchase: {
      segment: "Purchase",
      definition: "Loan for home purchase.",
      pct: 55.2,
      insights: ["Slightly over half of portfolio."],
    },
    Refinance: {
      segment: "Refinance",
      definition: "Loan for refinancing.",
      pct: 44.8,
      insights: ["Rate-sensitive segment."],
    },
  },
  states: {
    CA: { segment: "CA", definition: "California.", pct: 10.8, insights: ["Largest state exposure."] },
    FL: { segment: "FL", definition: "Florida.", pct: 10.1, insights: ["Second largest."] },
    GA: { segment: "GA", definition: "Georgia.", pct: 9.6, insights: ["Strong presence."] },
    PA: { segment: "PA", definition: "Pennsylvania.", pct: 7.1, insights: [] },
    NY: { segment: "NY", definition: "New York.", pct: 4.5, insights: [] },
    MD: { segment: "MD", definition: "Maryland.", pct: 3.3, insights: [] },
    MA: { segment: "MA", definition: "Massachusetts.", pct: 2.8, insights: [] },
    NJ: { segment: "NJ", definition: "New Jersey.", pct: 2.4, insights: [] },
    VA: { segment: "VA", definition: "Virginia.", pct: 1.9, insights: [] },
    Other: { segment: "Other", definition: "All other states combined.", pct: 47.5, insights: ["Diversified exposure."] },
  },
};

export type WacProductDrilldown = {
  name: string;
  loans: number;
  wac: number;
  definition: string;
  insights: string[];
};

export const step8WacDrilldown: Record<string, WacProductDrilldown> = {
  "5/1 ARM": {
    name: "5/1 ARM",
    loans: 420,
    wac: 3.25,
    definition: "5-year fixed, then adjusts annually.",
    insights: ["Lowest WAC; rate-sensitive.", "Smaller share of portfolio."],
  },
  "7/1 ARM": {
    name: "7/1 ARM",
    loans: 890,
    wac: 3.55,
    definition: "7-year fixed, then adjusts annually.",
    insights: ["Moderate WAC.", "Growing segment."],
  },
  "10/1 ARM": {
    name: "10/1 ARM",
    loans: 650,
    wac: 3.72,
    definition: "10-year fixed, then adjusts annually.",
    insights: ["Between ARM and FRM pricing."],
  },
  "15 FRM": {
    name: "15 FRM",
    loans: 792,
    wac: 3.85,
    definition: "15-year fixed-rate mortgage.",
    insights: ["Shorter tenure; typically stronger credit."],
  },
  "30 FRM": {
    name: "30 FRM",
    loans: 5361,
    wac: 4.28,
    definition: "30-year fixed-rate mortgage.",
    insights: ["Highest WAC; dominant product.", "85% of portfolio."],
  },
};

export type CreditMetricDrilldown = {
  label: string;
  value: string;
  definition: string;
  insights: string[];
};

export type KpiDrilldown = {
  label: string;
  value: string;
  definition: string;
  insights: string[];
};

export const step8KpiDrilldown: Record<string, KpiDrilldown> = {
  upb: {
    label: "Total Unpaid Principal Balance (UPB)",
    value: "1,534,248,974",
    definition: "Sum of outstanding principal across all selected loans.",
    insights: ["Key portfolio size metric."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "6,293",
    definition: "Count of loans in the selected portfolio.",
    insights: ["Portfolio granularity."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "4.13",
    definition: "Interest rate weighted by principal.",
    insights: ["*Selected Loans."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.73",
    definition: "Annualized yield on bond-equivalent basis.",
    insights: ["*Selected Loans."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "7.51",
    definition: "Years to repricing.",
    insights: ["*Selected Loans."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "103.05",
    definition: "Indicative market price as % of par.",
    insights: ["**Teraverde Indicative Pricing."],
  },
};

export const step8CreditDrilldown: Record<string, CreditMetricDrilldown> = {
  avgLoanSize: {
    label: "Average Loan Size",
    value: "243,802",
    definition: "Mean loan size across selected loans.",
    insights: ["Key for portfolio sizing."],
  },
  wavgLtv: {
    label: "Weighted Average LTV",
    value: "80.33%",
    definition: "Loan-to-value weighted by principal.",
    insights: ["Credit risk indicator."],
  },
  wavgFico: {
    label: "Weighted Average FICO",
    value: "720",
    definition: "FICO score weighted by principal.",
    insights: ["Credit quality indicator."],
  },
  wavgDti: {
    label: "Weighted Average DTI",
    value: "37.74%",
    definition: "Debt-to-income weighted by principal.",
    insights: ["Affordability indicator."],
  },
  wavgMaturity: {
    label: "Weighted Average Maturity",
    value: "28",
    definition: "Years to maturity weighted by principal.",
    insights: ["Duration indicator."],
  },
};

