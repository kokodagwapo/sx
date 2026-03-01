import type { TrendDatum } from "@/components/charts/AreaTrendChart";

/** Historical Loan Yields - Last Five Quarters (Total Loans and Leases) */
export const step6bYieldTrend: TrendDatum[] = [
  { name: "3/31/2016", value: 5.63 },
  { name: "6/30/2016", value: 4.85 },
  { name: "9/30/2016", value: 4.73 },
  { name: "12/31/2016", value: 4.83 },
  { name: "3/31/2017", value: 4.71 },
];

export type QuarterDrilldown = {
  quarter: string;
  yield: number;
  totalLoans: string;
  avgLoanSize: string;
  loanTypeBreakdown: { type: string; pct: number }[];
  insights: string[];
};

export const step6bQuarterDrilldown: Record<string, QuarterDrilldown> = {
  "3/31/2016": {
    quarter: "Q1 2016",
    yield: 5.63,
    totalLoans: "712,450,000",
    avgLoanSize: "113,200",
    loanTypeBreakdown: [
      { type: "Real Estate", pct: 58 },
      { type: "1-4 Family", pct: 22 },
      { type: "Commercial", pct: 12 },
      { type: "Other", pct: 8 },
    ],
    insights: [
      "Highest yield in the five-quarter period driven by favorable rate environment.",
      "Real estate loans comprised 58% of portfolio with above-average spreads.",
      "Q1 typically benefits from seasonal refinancing activity.",
    ],
  },
  "6/30/2016": {
    quarter: "Q2 2016",
    yield: 4.85,
    totalLoans: "728,100,000",
    avgLoanSize: "115,600",
    loanTypeBreakdown: [
      { type: "Real Estate", pct: 56 },
      { type: "1-4 Family", pct: 24 },
      { type: "Commercial", pct: 11 },
      { type: "Other", pct: 9 },
    ],
    insights: [
      "Yield compression of 78 bps from Q1 as rates normalized.",
      "Portfolio grew 2.2% quarter-over-quarter.",
      "Shift toward 1-4 Family reflected in mix change.",
    ],
  },
  "9/30/2016": {
    quarter: "Q3 2016",
    yield: 4.73,
    totalLoans: "738,200,000",
    avgLoanSize: "117,100",
    loanTypeBreakdown: [
      { type: "Real Estate", pct: 55 },
      { type: "1-4 Family", pct: 25 },
      { type: "Commercial", pct: 11 },
      { type: "Other", pct: 9 },
    ],
    insights: [
      "Lowest yield in the period; competitive pricing pressure.",
      "Steady portfolio growth with disciplined origination.",
      "Commercial segment held steady at 11%.",
    ],
  },
  "12/31/2016": {
    quarter: "Q4 2016",
    yield: 4.83,
    totalLoans: "752,400,000",
    avgLoanSize: "119,400",
    loanTypeBreakdown: [
      { type: "Real Estate", pct: 54 },
      { type: "1-4 Family", pct: 26 },
      { type: "Commercial", pct: 12 },
      { type: "Other", pct: 8 },
    ],
    insights: [
      "Yield recovered 10 bps from Q3 low.",
      "Year-end portfolio up 5.6% from Q1.",
      "Commercial mix increased to 12%.",
    ],
  },
  "3/31/2017": {
    quarter: "Q1 2017",
    yield: 4.71,
    totalLoans: "762,716,000",
    avgLoanSize: "121,200",
    loanTypeBreakdown: [
      { type: "Real Estate", pct: 53 },
      { type: "1-4 Family", pct: 27 },
      { type: "Commercial", pct: 12 },
      { type: "Other", pct: 8 },
    ],
    insights: [
      "Current quarter—baseline for pro-forma comparison.",
      "Total Loans & Leases: $762.7M (As of Last Quarter).",
      "Yield down 12 bps from Q4; reflects current rate environment.",
    ],
  },
};

export type MetricDrilldown = {
  label: string;
  value: string;
  definition: string;
  components?: string[];
  insights: string[];
};

export const step6bKpiDrilldown: Record<string, MetricDrilldown> = {
  upb: {
    label: "Total Unpaid Principal Balance (UPB)",
    value: "1,534,248,974",
    definition: "Sum of outstanding principal across all loans meeting selection criteria.",
    components: ["Selected loans only", "Excludes paid-off or charged-off"],
    insights: ["Key portfolio size metric for pricing and risk.", "Drives interest income projections."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "6,293",
    definition: "Count of loans that pass the current filter and selection criteria.",
    insights: ["Granularity indicator for portfolio diversification.", "Used in weighted-average calculations."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "4.13",
    definition: "Interest rate weighted by principal balance across selected loans.",
    insights: ["*Selected Loans. Reflects contractual yield before adjustments."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.73",
    definition: "Annualized yield on a bond-equivalent basis for selected loans.",
    insights: ["*Selected Loans. Standardized for fixed-income comparison."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "7.51",
    definition: "Interest-rate sensitivity measure; years to repricing.",
    insights: ["*Selected Loans. Key for rate risk management."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "103.05",
    definition: "Indicative market price as percentage of par for selected pool.",
    insights: ["**Teraverde Indicative Pricing. For valuation reference."],
  },
};

export const step6bCurrentDrilldown: Record<string, MetricDrilldown> = {
  interestIncome: {
    label: "Total Interest Income (Loans)",
    value: "36,061,856",
    definition: "Annualized interest income from loans as of last quarter.",
    insights: ["Based on Avg Total Loans.", "Drives Current Portfolio Yield calculation."],
  },
  totalLoans: {
    label: "Total Loans & Leases",
    value: "762,716,000",
    definition: "Outstanding principal of loans and leases as of last quarter.",
    insights: ["Denominator for yield calculation.", "Baseline for pro-forma comparison."],
  },
  yield: {
    label: "Current Portfolio Yield^",
    value: "4.71",
    definition: "Annualized yield = Interest Income / Avg Total Loans.",
    insights: ["^Based on Avg Total Loans.", "Benchmark for projected portfolio."],
  },
};

export const step6bProjectedDrilldown: Record<string, MetricDrilldown> = {
  interestIncome: {
    label: "Total Interest Income (Loans)",
    value: "93,338,080",
    definition: "Projected annualized interest income including selected loans.",
    insights: ["159% increase vs. current.", "Driven by larger portfolio and mix."],
  },
  totalLoans: {
    label: "Total Loans & Leases",
    value: "2,296,964,974",
    definition: "Projected outstanding principal with selected loans added.",
    insights: ["3× current portfolio size.", "Includes selected loans."],
  },
  yield: {
    label: "Bond Equivalent Yield^^",
    value: "4.06",
    definition: "Projected yield on bond-equivalent basis for combined portfolio.",
    insights: ["^^Includes selected loans.", "35 bps above current yield."],
  },
};
