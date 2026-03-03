import type { DonutDatum } from "@/components/charts/DonutChart";

export const step8ProductType: DonutDatum[] = [
  { name: "30 FRM", value: 78.1 },
  { name: "15 FRM", value: 20.6 },
  { name: "5/1 ARM", value: 0.7 },
  { name: "7/1 ARM", value: 0.6 },
];

export const step8Occupancy: DonutDatum[] = [
  { name: "Owner", value: 92.8 },
  { name: "Investment", value: 5.7 },
  { name: "Second Home", value: 1.5 },
];

export const step8Purpose: DonutDatum[] = [
  { name: "Refinance", value: 64.6 },
  { name: "Purchase", value: 35.4 },
];

export const step8States: DonutDatum[] = [
  { name: "CA", value: 20.6 },
  { name: "FL", value: 5.1 },
  { name: "GA", value: 4.6 },
  { name: "PA", value: 4.7 },
  { name: "NY", value: 4.9 },
  { name: "TX", value: 4.4 },
  { name: "NJ", value: 4.0 },
  { name: "WA", value: 3.7 },
  { name: "MD", value: 3.5 },
  { name: "Other", value: 44.5 },
];

export type WacByProductDatum = {
  name: string;
  loans: number;
  wac: number;
};

export const step8WacByProduct: WacByProductDatum[] = [
  { name: "5/1 ARM", loans: 51, wac: 3.08 },
  { name: "7/1 ARM", loans: 44, wac: 3.22 },
  { name: "15 FRM", loans: 1450, wac: 2.92 },
  { name: "30 FRM", loans: 5506, wac: 3.67 },
];

export type LoanTermRow = {
  term: string;
  loans: number;
  totalAmount: number;
  wpi: number;
};

export const step8LoanTerms: LoanTermRow[] = [
  { term: "ARM", loans: 95, totalAmount: 26_850_000, wpi: 100.45 },
  { term: "180", loans: 1450, totalAmount: 376_200_000, wpi: 101.82 },
  { term: "240", loans: 48, totalAmount: 11_200_000, wpi: 101.10 },
  { term: "300", loans: 5, totalAmount: 1_150_000, wpi: 100.80 },
  { term: "360", loans: 5452, totalAmount: 1_447_000_000, wpi: 100.75 },
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
      pct: 78.1,
      insights: ["Dominant product at 78.1%; drives portfolio WAC.", "5,506 loans totalling ~$1.45B UPB."],
    },
    "15 FRM": {
      segment: "15 FRM",
      definition: "15-year fixed-rate mortgage.",
      pct: 20.6,
      insights: ["Second largest segment at 20.6%; 1,450 loans.", "Lower duration and WAC than 30 FRM."],
    },
    "5/1 ARM": {
      segment: "5/1 ARM",
      definition: "5-year adjustable-rate mortgage.",
      pct: 0.7,
      insights: ["Small share at 51 loans; rate-sensitive exposure."],
    },
    "7/1 ARM": {
      segment: "7/1 ARM",
      definition: "7-year adjustable-rate mortgage.",
      pct: 0.6,
      insights: ["44 loans; minimal rate risk contribution."],
    },
  },
  occupancy: {
    Owner: {
      segment: "Owner",
      definition: "Owner-occupied property.",
      pct: 92.8,
      insights: ["Primary residence at 92.8%; 6,539 loans.", "Strongest credit quality segment."],
    },
    Investment: {
      segment: "Investment",
      definition: "Investment property.",
      pct: 5.7,
      insights: ["402 investment loans; LLPA-adjusted pricing.", "Higher DTI tolerance in this segment."],
    },
    "Second Home": {
      segment: "Second Home",
      definition: "Second home or vacation property.",
      pct: 1.5,
      insights: ["109 second-home loans; moderate risk profile."],
    },
  },
  purpose: {
    Refinance: {
      segment: "Refinance",
      definition: "Loan for refinancing existing mortgage.",
      pct: 64.6,
      insights: ["Refinance-heavy pool at 64.6%; 4,551 loans.", "Rate-sensitive; reflects 2016 low-rate environment."],
    },
    Purchase: {
      segment: "Purchase",
      definition: "Loan for home purchase.",
      pct: 35.4,
      insights: ["2,499 purchase loans; typically stronger underwriting.", "Balanced by geographic diversification."],
    },
  },
  states: {
    CA: { segment: "CA", definition: "California.", pct: 20.6, insights: ["Largest state by UPB at $523.8M; 1,449 loans."] },
    FL: { segment: "FL", definition: "Florida.", pct: 5.1, insights: ["422 loans; $94.9M UPB."] },
    NY: { segment: "NY", definition: "New York.", pct: 4.9, insights: ["276 loans; $90.3M UPB."] },
    PA: { segment: "PA", definition: "Pennsylvania.", pct: 4.7, insights: ["378 loans; $87.7M UPB."] },
    GA: { segment: "GA", definition: "Georgia.", pct: 4.6, insights: ["392 loans; $85.7M UPB."] },
    TX: { segment: "TX", definition: "Texas.", pct: 4.4, insights: ["355 loans; $82.0M UPB."] },
    NJ: { segment: "NJ", definition: "New Jersey.", pct: 4.0, insights: ["250 loans; $74.7M UPB."] },
    WA: { segment: "WA", definition: "Washington.", pct: 3.7, insights: ["224 loans; $68.6M UPB."] },
    MD: { segment: "MD", definition: "Maryland.", pct: 3.5, insights: ["226 loans; $65.3M UPB."] },
    Other: { segment: "Other", definition: "All other states combined.", pct: 44.5, insights: ["Broad geographic diversification across 40+ states."] },
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
    loans: 51,
    wac: 3.08,
    definition: "5-year fixed, then adjusts annually.",
    insights: ["51 loans; rate-sensitive with near-term repricing.", "Small pool contribution."],
  },
  "7/1 ARM": {
    name: "7/1 ARM",
    loans: 44,
    wac: 3.22,
    definition: "7-year fixed, then adjusts annually.",
    insights: ["44 loans; minimal rate risk contribution.", "Moderate WAC versus fixed products."],
  },
  "15 FRM": {
    name: "15 FRM",
    loans: 1450,
    wac: 2.92,
    definition: "15-year fixed-rate mortgage.",
    insights: ["1,450 loans; lowest WAC in portfolio.", "Shorter duration reduces rate risk significantly."],
  },
  "30 FRM": {
    name: "30 FRM",
    loans: 5506,
    wac: 3.67,
    definition: "30-year fixed-rate mortgage.",
    insights: ["5,506 loans; dominant product at 78.1% of pool.", "Highest WAC and longest duration."],
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
    value: "1,860,760,635",
    definition: "Sum of outstanding principal across all selected loans.",
    insights: ["$1.861B across 7,050 loans from three lenders.", "Key portfolio size metric for pricing and risk."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "7,050",
    definition: "Count of loans in the selected portfolio.",
    insights: ["Provident 2,450 | Stonegate 963 | New Penn Financial 3,637.", "Strong diversification across lenders."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "3.50",
    definition: "Interest rate weighted by principal balance across selected loans.",
    insights: ["*Selected Loans. Reflects contractual yield.", "Low-rate vintage: originated primarily in 2016."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.17",
    definition: "Annualized yield on bond-equivalent basis for selected loans.",
    insights: ["*Selected Loans. Standardized for fixed-income comparison.", "Calculated as WAC − 0.33% servicing spread."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "6.80",
    definition: "Interest-rate sensitivity; years to repricing.",
    insights: ["*Selected Loans. Driven by 78% 30 FRM product mix.", "20.6% 15 FRM allocation reduces portfolio duration."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "100.71",
    definition: "Indicative market price as % of par for selected pool.",
    insights: ["**Teraverde Indicative Pricing. For valuation reference.", "Near-par pricing reflects current rate environment."],
  },
};

export const step8CreditDrilldown: Record<string, CreditMetricDrilldown> = {
  avgLoanSize: {
    label: "Average Loan Size",
    value: "264,000",
    definition: "Mean loan size across selected loans.",
    insights: ["$264K average balance; above conforming threshold for many products."],
  },
  wavgLtv: {
    label: "Weighted Average LTV",
    value: "71.42%",
    definition: "Loan-to-value weighted by principal.",
    insights: ["71.42% WA LTV; well within conforming risk guidelines."],
  },
  wavgFico: {
    label: "Weighted Average FICO",
    value: "744",
    definition: "FICO score weighted by principal.",
    insights: ["744 WA FICO; strong credit quality pool.", "31% of loans have FICO 780+."],
  },
  wavgDti: {
    label: "Weighted Average DTI",
    value: "35.57%",
    definition: "Debt-to-income weighted by principal.",
    insights: ["35.57% WA DTI; within QM guidelines.", "60% of loans in the 35–39% bucket."],
  },
  wavgMaturity: {
    label: "Weighted Average Maturity",
    value: "27",
    definition: "Years to maturity weighted by principal.",
    insights: ["Driven by 78% 30-year product dominance."],
  },
};
