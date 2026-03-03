import type { TrendDatum } from "@/components/charts/AreaTrendChart";

/** Historical Loan Yields - Last Five Quarters (Total Loans and Leases)
 *  Anchored on WA Coupon 3.50% — real portfolio vintage 2016 */
export const step6bYieldTrend: TrendDatum[] = [
  { name: "3/31/2016", value: 4.18 },
  { name: "6/30/2016", value: 3.84 },
  { name: "9/30/2016", value: 3.71 },
  { name: "12/31/2016", value: 3.78 },
  { name: "3/31/2017", value: 3.50 },
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
    yield: 4.18,
    totalLoans: "1,247,300,000",
    avgLoanSize: "241,600",
    loanTypeBreakdown: [
      { type: "30 FRM", pct: 76 },
      { type: "15 FRM", pct: 22 },
      { type: "ARM", pct: 2 },
    ],
    insights: [
      "Highest yield in the five-quarter period prior to rate compression.",
      "Provident tape being assembled; 30 FRM dominated early acquisitions.",
      "Q1 typically reflects prior year lock-in rates.",
    ],
  },
  "6/30/2016": {
    quarter: "Q2 2016",
    yield: 3.84,
    totalLoans: "1,408,500,000",
    avgLoanSize: "252,800",
    loanTypeBreakdown: [
      { type: "30 FRM", pct: 77 },
      { type: "15 FRM", pct: 21 },
      { type: "ARM", pct: 2 },
    ],
    insights: [
      "Yield compression of 34 bps as Stonegate loans joined the pool.",
      "New Penn Financial loans starting to flow; larger avg balance.",
      "Refinance volume surged mid-2016 driving WAC lower.",
    ],
  },
  "9/30/2016": {
    quarter: "Q3 2016",
    yield: 3.71,
    totalLoans: "1,598,200,000",
    avgLoanSize: "259,400",
    loanTypeBreakdown: [
      { type: "30 FRM", pct: 78 },
      { type: "15 FRM", pct: 20 },
      { type: "ARM", pct: 2 },
    ],
    insights: [
      "Lowest yield as rate environment hit cycle lows.",
      "Pool UPB grew 13.5% from Q2; New Penn Financial fully onboarded.",
      "15 FRM share held steady, limiting duration extension.",
    ],
  },
  "12/31/2016": {
    quarter: "Q4 2016",
    yield: 3.78,
    totalLoans: "1,746,900,000",
    avgLoanSize: "261,100",
    loanTypeBreakdown: [
      { type: "30 FRM", pct: 78 },
      { type: "15 FRM", pct: 20 },
      { type: "ARM", pct: 2 },
    ],
    insights: [
      "Yield recovered 7 bps from Q3 as post-election rates ticked up.",
      "Year-end pool up 40% from Q1; $1.747B combined UPB.",
      "ARM share remained minimal; conservative product mix maintained.",
    ],
  },
  "3/31/2017": {
    quarter: "Q1 2017",
    yield: 3.50,
    totalLoans: "1,861,333,635",
    avgLoanSize: "264,000",
    loanTypeBreakdown: [
      { type: "30 FRM", pct: 78 },
      { type: "15 FRM", pct: 21 },
      { type: "ARM", pct: 1 },
    ],
    insights: [
      "Current quarter — final pool of 7,050 loans / $1.861B UPB.",
      "WA Coupon: 3.50% | WA FICO: 744 | WA LTV: 71.42% | WA DTI: 35.57%.",
      "WA Price 100.71; near-par pricing reflects current rate environment.",
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
    value: "1,861,333,635",
    definition: "Sum of outstanding principal across all loans meeting selection criteria.",
    components: ["Provident: $710.8M (2,450 loans)", "Stonegate: $209.1M (963 loans)", "New Penn Financial: $940.9M (3,637 loans)"],
    insights: ["$1.861B total across three seller tapes.", "Drives interest income projections and pool valuation."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "7,050",
    definition: "Count of loans that pass the current filter and selection criteria.",
    insights: ["7,050 loans across three lenders and 49 states.", "Strong granularity; avg balance $264K."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "3.50",
    definition: "Interest rate weighted by principal balance across selected loans.",
    insights: ["*Selected Loans. Reflects contractual yield before adjustments.", "Low-rate 2016 vintage; 78% 30 FRM product mix."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.17",
    definition: "Annualized yield on a bond-equivalent basis for selected loans.",
    insights: ["*Selected Loans. WAC minus 0.33% servicing spread.", "Standardized for fixed-income comparison."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "6.80",
    definition: "Interest-rate sensitivity measure; years to repricing.",
    insights: ["*Selected Loans. 20.6% 15 FRM allocation reduces total portfolio duration.", "Key metric for rate risk and hedging strategy."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "100.71",
    definition: "Indicative market price as percentage of par for selected pool.",
    insights: ["**Teraverde Indicative Pricing. For valuation reference.", "Near-par pricing reflects current coupon relative to market rates."],
  },
};

export const step6bCurrentDrilldown: Record<string, MetricDrilldown> = {
  interestIncome: {
    label: "Total Interest Income (Loans)",
    value: "35,946,000",
    definition: "Annualized interest income from current bank loan portfolio (last quarter).",
    insights: ["Based on Avg Total Loans.", "Drives Current Portfolio Yield calculation."],
  },
  totalLoans: {
    label: "Total Loans & Leases",
    value: "762,716,000",
    definition: "Outstanding principal of existing loans and leases as of last quarter.",
    insights: ["Denominator for current yield calculation.", "Baseline for pro-forma comparison."],
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
    value: "101,619,000",
    definition: "Projected annualized interest income including selected pool of $1.861B.",
    insights: ["182% increase vs. current $36.0M.", "Driven by larger pool; WAC 3.50%."],
  },
  totalLoans: {
    label: "Total Loans & Leases",
    value: "2,623,476,635",
    definition: "Projected outstanding principal with selected loans added to existing portfolio.",
    insights: ["3.4× current portfolio size.", "Includes all 7,050 selected loans."],
  },
  yield: {
    label: "Bond Equivalent Yield^^",
    value: "3.87",
    definition: "Projected yield on bond-equivalent basis for combined portfolio.",
    insights: ["^^Includes selected loans at 3.50% WAC blended with existing 4.71%.", "Blended yield improvement of -84 bps vs. stand-alone."],
  },
};
