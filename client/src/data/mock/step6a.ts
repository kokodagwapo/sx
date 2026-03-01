import type { ComparisonDatum } from "@/components/charts/ComparisonHorizontalBarChart";

export type LoanTypeDrilldown = {
  loanType: string;
  currentPct: number;
  proFormaPct: number;
  delta: number;
  deltaPct: number;
  concentrationRank: number;
  insights: string[];
};

export const step6aComposition: ComparisonDatum[] = [
  { name: "Total Real Estate Loans", current: 558_489, proForma: 2_892_738 },
  { name: "Total 1-4 Family Loans", current: 128_847, proForma: 1_662_296 },
  { name: "Comm RE(Nonfarm/NonRes)", current: 320_511, proForma: 320_511 },
  { name: "Total Non-Real Estate Loans", current: 204_227, proForma: 204_227 },
  { name: "All Other Loans", current: 118_888, proForma: 118_888 },
  { name: "Commercial & Industrial Loans", current: 88_227, proForma: 86_227 },
  { name: "Constr & Land Development", current: 72_401, proForma: 72_481 },
  { name: "Multifamily Loans", current: 37_143, proForma: 37_143 },
  { name: "Farm Loans", current: 387, proForma: 387 },
];

/** Drilldown insights per loan type for executive summary */
export const step6aDrilldown: Record<string, LoanTypeDrilldown> = {
  "Total Real Estate Loans": {
    loanType: "Total Real Estate Loans",
    currentPct: 37,
    proFormaPct: 46,
    delta: 2_334_249,
    deltaPct: 418,
    concentrationRank: 1,
    insights: [
      "Largest category in both periods; projected growth of 418%.",
      "Represents 46% of pro-forma portfolio—key concentration risk.",
      "Driven by 1-4 family and multifamily additions.",
    ],
  },
  "Total 1-4 Family Loans": {
    loanType: "Total 1-4 Family Loans",
    currentPct: 9,
    proFormaPct: 26,
    delta: 1_533_449,
    deltaPct: 1190,
    concentrationRank: 2,
    insights: [
      "Highest growth rate among all categories (+1,190%).",
      "Moves from 9% to 26% of portfolio—strategic shift.",
      "Indicates strong residential mortgage pipeline.",
    ],
  },
  "Comm RE(Nonfarm/NonRes)": {
    loanType: "Comm RE(Nonfarm/NonRes)",
    currentPct: 21,
    proFormaPct: 5,
    delta: 0,
    deltaPct: 0,
    concentrationRank: 3,
    insights: [
      "No change in projected period—stable commercial exposure.",
      "Share declines from 21% to 5% due to portfolio growth elsewhere.",
      "Lower concentration risk post-selection.",
    ],
  },
  "Total Non-Real Estate Loans": {
    loanType: "Total Non-Real Estate Loans",
    currentPct: 14,
    proFormaPct: 3,
    delta: 0,
    deltaPct: 0,
    concentrationRank: 4,
    insights: [
      "Flat projection—no new non-RE loans in selection.",
      "Relative share decreases as RE portfolio expands.",
    ],
  },
  "All Other Loans": {
    loanType: "All Other Loans",
    currentPct: 8,
    proFormaPct: 2,
    delta: 0,
    deltaPct: 0,
    concentrationRank: 5,
    insights: ["No projected change.", "Maintains baseline exposure."],
  },
  "Commercial & Industrial Loans": {
    loanType: "Commercial & Industrial Loans",
    currentPct: 6,
    proFormaPct: 1,
    delta: -2_000,
    deltaPct: -2,
    concentrationRank: 6,
    insights: [
      "Slight decrease (-2%) in projected period.",
      "Mature C&I book with minimal new originations.",
    ],
  },
  "Constr & Land Development": {
    loanType: "Constr & Land Development",
    currentPct: 5,
    proFormaPct: 1,
    delta: 80,
    deltaPct: 0.1,
    concentrationRank: 7,
    insights: ["Marginal increase; construction pipeline stable."],
  },
  "Multifamily Loans": {
    loanType: "Multifamily Loans",
    currentPct: 2,
    proFormaPct: 1,
    delta: 0,
    deltaPct: 0,
    concentrationRank: 8,
    insights: ["No change; existing multifamily book retained."],
  },
  "Farm Loans": {
    loanType: "Farm Loans",
    currentPct: 0.03,
    proFormaPct: 0.01,
    delta: 0,
    deltaPct: 0,
    concentrationRank: 9,
    insights: ["Minimum exposure; niche segment."],
  },
};

