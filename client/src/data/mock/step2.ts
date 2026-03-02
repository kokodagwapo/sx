import type { VerticalBarDatum } from "@/components/charts/VerticalBarChart";
import type { DonutDatum } from "@/components/charts/DonutChart";

export const step2InterestRateBars: VerticalBarDatum[] = [
  { name: "2–2.5", value: 26 },
  { name: "2.5–3", value: 42 },
  { name: "3–3.5", value: 301 },
  { name: "3.5–4", value: 1600 },
  { name: "4–4.5", value: 2665 },
  { name: "4.5–5", value: 1380 },
  { name: "5–5.5", value: 210 },
  { name: "5.5–6", value: 78 },
];

export const step2StateCountyBars: VerticalBarDatum[] = [
  { name: "CA", value: 600 },
  { name: "FL", value: 512 },
  { name: "GA", value: 465 },
  { name: "NY", value: 443 },
  { name: "PA", value: 270 },
  { name: "TX", value: 261 },
  { name: "VA", value: 190 },
  { name: "WA", value: 178 },
  { name: "AZ", value: 160 },
  { name: "NJ", value: 150 },
];

export const step2ProductTypeDonut: DonutDatum[] = [
  { name: "30 FRM", value: 87 },
  { name: "15 FRM", value: 13 },
];

export const step2PurposeDonut: DonutDatum[] = [
  { name: "Purchase", value: 52 },
  { name: "Refinance", value: 48 },
];

export const step2LoanTypeDonut: DonutDatum[] = [
  { name: "Conventional", value: 59 },
  { name: "Government", value: 41 },
  { name: "Jumbo", value: 9 },
];

