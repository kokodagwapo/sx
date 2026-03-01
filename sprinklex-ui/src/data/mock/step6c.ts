import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";

/** Loan Balances % of Tier 1 + ALLL - Most Recent Quarter (blue bars) */
export const step6cRecent: HorizontalBarDatum[] = [
  { name: "Total 1-4 Family Loans", value: 125.5 },
  { name: "Constr & Land Development", value: 71.6 },
  { name: "Multifamily Loans", value: 36.4 },
  { name: "Comm RE (Nonfarm/NonRes)", value: 314.3 },
  { name: "Farm Loans", value: 8.4 },
  { name: "Total Real Estate Loans", value: 547.6 },
  { name: "Commercial & Industrial Loans", value: 84.5 },
  { name: "Consumer Loans", value: 8.8 },
  { name: "All Other Loans", value: 115.7 },
  { name: "Total Non-Real Estate Loans", value: 200.2 },
];

/** Loan Balances % of Tier 1 + ALLL - Pro forma (red bars) */
export const step6cProForma: HorizontalBarDatum[] = [
  { name: "Total 1-4 Family Loans", value: 1429.2 },
  { name: "Constr & Land Development", value: 62.2 },
  { name: "Multifamily Loans", value: 31.9 },
  { name: "Comm RE (Nonfarm/NonRes)", value: 275.6 },
  { name: "Farm Loans", value: 8.3 },
  { name: "Total Real Estate Loans", value: 1729.3 },
  { name: "Commercial & Industrial Loans", value: 74.1 },
  { name: "Consumer Loans", value: 8.0 },
  { name: "All Other Loans", value: 101.5 },
  { name: "Total Non-Real Estate Loans", value: 175.6 },
];

export type ConcentrationRow = {
  loanType: string;
  loanBalance: number;
  pastDueNonAccrual: number;
};

/** Major Loan Concentration Pools: Most Recent Quarter (Dollars in Thousands) */
export const step6cTableRecent: ConcentrationRow[] = [
  { loanType: "All Other Loans", loanBalance: 118_000, pastDueNonAccrual: 0 },
  { loanType: "Comm RE(Nonfarm/NonRes)", loanBalance: 320_511, pastDueNonAccrual: 4_594 },
  { loanType: "Commercial & Industrial Loans", loanBalance: 86_227, pastDueNonAccrual: 2_875 },
  { loanType: "Constr & Land Development", loanBalance: 72_401, pastDueNonAccrual: 45 },
  { loanType: "Consumer Loans", loanBalance: 0, pastDueNonAccrual: 0 },
  { loanType: "Farm Loans", loanBalance: 387, pastDueNonAccrual: 0 },
  { loanType: "Multifamily Loans", loanBalance: 37_143, pastDueNonAccrual: 258 },
  { loanType: "Total 1-4 Family Loans", loanBalance: 128_047, pastDueNonAccrual: 1_068 },
  { loanType: "Total Non-Real Estate Loans", loanBalance: 204_227, pastDueNonAccrual: 2_875 },
  { loanType: "Total Real Estate Loans", loanBalance: 558_489, pastDueNonAccrual: 5_965 },
];

/** Major Loan Concentration Pools: Pro forma (Dollars in Thousands) */
export const step6cTableProForma: ConcentrationRow[] = [
  { loanType: "All Other Loans", loanBalance: 118_000, pastDueNonAccrual: 0 },
  { loanType: "Comm RE(Nonfarm/NonRes)", loanBalance: 320_511, pastDueNonAccrual: 4_594 },
  { loanType: "Commercial & Industrial Loans", loanBalance: 86_227, pastDueNonAccrual: 2_875 },
  { loanType: "Constr & Land Development", loanBalance: 72_401, pastDueNonAccrual: 45 },
  { loanType: "Consumer Loans", loanBalance: 0, pastDueNonAccrual: 0 },
  { loanType: "Farm Loans", loanBalance: 387, pastDueNonAccrual: 0 },
  { loanType: "Multifamily Loans", loanBalance: 37_143, pastDueNonAccrual: 258 },
  { loanType: "Total 1-4 Family Loans", loanBalance: 1_662_296, pastDueNonAccrual: 1_068 },
  { loanType: "Total Non-Real Estate Loans", loanBalance: 204_227, pastDueNonAccrual: 2_875 },
  { loanType: "Total Real Estate Loans", loanBalance: 2_092_738, pastDueNonAccrual: 5_965 },
];

/** Capital metrics - Most Recent Quarter */
export const step6cCapitalRecent = {
  tier1Capital: 95_197,
  tier1PlusAlll: 101_992,
  tier1LeverageRatio: 11.11,
};

/** Capital metrics - Pro forma */
export const step6cCapitalProForma = {
  tier1Capital: 109_516,
  tier1PlusAlll: 116_311,
  tier1LeverageRatio: 4.58,
};

export type LoanTypeDrilldown = {
  loanType: string;
  definition: string;
  recentPct: number;
  proFormaPct: number;
  deltaPct: number;
  riskLevel: "low" | "medium" | "high";
  insights: string[];
};

export const step6cLoanDrilldown: Record<string, LoanTypeDrilldown> = {
  "Total 1-4 Family Loans": {
    loanType: "Total 1-4 Family Loans",
    definition: "Residential mortgages (1–4 unit properties).",
    recentPct: 125.5,
    proFormaPct: 1429.2,
    deltaPct: 1303.7,
    riskLevel: "high",
    insights: [
      "Pro forma concentration jumps 10×—driven by selected loan additions.",
      "Regulatory concentration limits may apply; monitor closely.",
      "Key driver of Tier 1 Leverage Ratio decline.",
    ],
  },
  "Total Real Estate Loans": {
    loanType: "Total Real Estate Loans",
    definition: "Aggregate of all real estate–secured loans.",
    recentPct: 547.6,
    proFormaPct: 1729.3,
    deltaPct: 1181.7,
    riskLevel: "high",
    insights: [
      "Pro forma nearly 3× current—significant capital impact.",
      "Includes 1-4 Family, Multifamily, Comm RE, Constr & Land Dev.",
      "Tier 1 Leverage Ratio drops from 11.11% to 4.58%.",
    ],
  },
  "Comm RE (Nonfarm/NonRes)": {
    loanType: "Comm RE (Nonfarm/NonRes)",
    definition: "Commercial real estate, nonfarm, nonresidential.",
    recentPct: 314.3,
    proFormaPct: 275.6,
    deltaPct: -38.7,
    riskLevel: "medium",
    insights: [
      "Concentration decreases in pro forma (same balance, higher capital base).",
      "Past due & non-accrual: $4,594K—monitor credit quality.",
    ],
  },
  "Total Non-Real Estate Loans": {
    loanType: "Total Non-Real Estate Loans",
    definition: "Commercial & Industrial, Consumer, All Other.",
    recentPct: 200.2,
    proFormaPct: 175.6,
    deltaPct: -24.6,
    riskLevel: "medium",
    insights: [
      "Includes Commercial & Industrial, Consumer Loans, All Other Loans.",
      "Concentration decreases as RE portfolio grows faster.",
    ],
  },
  "All Other Loans": {
    loanType: "All Other Loans",
    definition: "Loans not classified in other categories.",
    recentPct: 115.7,
    proFormaPct: 101.5,
    deltaPct: -14.2,
    riskLevel: "low",
    insights: ["Balance unchanged at $118M.", "Past due: $0."],
  },
  "Commercial & Industrial Loans": {
    loanType: "Commercial & Industrial Loans",
    definition: "Business loans for operating and investment purposes.",
    recentPct: 84.5,
    proFormaPct: 74.1,
    deltaPct: -10.4,
    riskLevel: "medium",
    insights: ["Past due & non-accrual: $2,875K.", "Concentration declines in pro forma."],
  },
  "Constr & Land Development": {
    loanType: "Constr & Land Development",
    definition: "Construction and land development loans.",
    recentPct: 71.6,
    proFormaPct: 62.2,
    deltaPct: -9.4,
    riskLevel: "medium",
    insights: ["Past due & non-accrual: $45K.", "Lower concentration in pro forma."],
  },
  "Multifamily Loans": {
    loanType: "Multifamily Loans",
    definition: "Loans secured by multifamily residential properties.",
    recentPct: 36.4,
    proFormaPct: 31.9,
    deltaPct: -4.5,
    riskLevel: "low",
    insights: ["Past due & non-accrual: $258K.", "Balance unchanged at $37.1M."],
  },
  "Consumer Loans": {
    loanType: "Consumer Loans",
    definition: "Consumer credit (auto, personal, etc.).",
    recentPct: 8.8,
    proFormaPct: 8.0,
    deltaPct: -0.8,
    riskLevel: "low",
    insights: ["Minimal exposure; balance $0 in table.", "Past due: $0."],
  },
  "Farm Loans": {
    loanType: "Farm Loans",
    definition: "Agricultural production and farm real estate loans.",
    recentPct: 8.4,
    proFormaPct: 8.3,
    deltaPct: -0.1,
    riskLevel: "low",
    insights: ["Smallest concentration; balance $387K.", "Past due: $0."],
  },
  // Alias for table row name (no space before paren)
  "Comm RE(Nonfarm/NonRes)": {
    loanType: "Comm RE (Nonfarm/NonRes)",
    definition: "Commercial real estate, nonfarm, nonresidential.",
    recentPct: 314.3,
    proFormaPct: 275.6,
    deltaPct: -38.7,
    riskLevel: "medium",
    insights: [
      "Concentration decreases in pro forma (same balance, higher capital base).",
      "Past due & non-accrual: $4,594K—monitor credit quality.",
    ],
  },
};

export type CapitalMetricDrilldown = {
  label: string;
  definition: string;
  recentValue: number;
  proFormaValue: number;
  delta: number;
  insights: string[];
};

export const step6cCapitalDrilldown: Record<string, CapitalMetricDrilldown> = {
  tier1Capital: {
    label: "Tier 1 Capital",
    definition: "Core capital: common equity, retained earnings, qualifying instruments.",
    recentValue: 95_197,
    proFormaValue: 109_516,
    delta: 14_319,
    insights: [
      "Pro forma increases 15% with selected loan transaction.",
      "Supports higher loan portfolio under regulatory rules.",
    ],
  },
  tier1PlusAlll: {
    label: "Tier 1 Capital + ALLL",
    definition: "Tier 1 Capital plus Allowance for Loan and Lease Losses.",
    recentValue: 101_992,
    proFormaValue: 116_311,
    delta: 14_319,
    insights: [
      "Denominator for concentration ratios (Loan Balances % of Tier 1 + ALLL).",
      "Pro forma: $116.3M—used for pro forma bar chart scaling.",
    ],
  },
  tier1LeverageRatio: {
    label: "Tier 1 Leverage Ratio",
    definition: "Tier 1 Capital / Average Total Consolidated Assets.",
    recentValue: 11.11,
    proFormaValue: 4.58,
    delta: -6.53,
    insights: [
      "Significant decrease: 11.11% → 4.58% reflects much larger pro forma balance sheet.",
      "Key regulatory metric—ensure compliance with minimum requirements.",
      "Driven by substantial increase in Total Real Estate and 1-4 Family concentrations.",
    ],
  },
};
