import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";
import type { DonutDatum } from "@/components/charts/DonutChart";

/** LTV Distribution — # of Loans by LTV range */
export const step3Ltv: HorizontalBarDatum[] = [
  { name: "0–10", value: 4 },
  { name: "10–20", value: 32 },
  { name: "20–30", value: 64 },
  { name: "30–40", value: 147 },
  { name: "40–50", value: 237 },
  { name: "50–60", value: 379 },
];

/** FICO Distribution — # of Loans by FICO range */
export const step3Fico: HorizontalBarDatum[] = [
  { name: "825–850", value: 2 },
  { name: "800–825", value: 523 },
  { name: "775–800", value: 958 },
  { name: "750–775", value: 774 },
  { name: "725–750", value: 659 },
  { name: "700–725", value: 814 },
];

/** DTI Distribution — # of Loans by DTI range */
export const step3Dti: HorizontalBarDatum[] = [
  { name: "0–5", value: 1 },
  { name: "5–10", value: 23 },
  { name: "10–15", value: 87 },
  { name: "15–20", value: 199 },
  { name: "20–25", value: 463 },
  { name: "25–30", value: 717 },
];

/** Product Distribution — 30 FRM 85.2%, 15 FRM 12.6%, other ~2% */
export const step3Product: DonutDatum[] = [
  { name: "30 FRM", value: 85.2, color: "#dc2626" },
  { name: "15 FRM", value: 12.6, color: "#3b82f6" },
  { name: "Other", value: 2.2, color: "#1e40af" },
];

/** Occupancy Distribution — Owner 91.5%, Investment 6.9% */
export const step3Occupancy: DonutDatum[] = [
  { name: "Owner", value: 91.5, color: "#dc2626" },
  { name: "Investment", value: 6.9, color: "#3b82f6" },
  { name: "Second home", value: 1.6, color: "#1e40af" },
];

/** Loan Purpose Distribution — Purchase 51.5%, Refinance 48.5% */
export const step3Purpose: DonutDatum[] = [
  { name: "Purchase", value: 51.5, color: "#dc2626" },
  { name: "Refinance", value: 48.5, color: "#1e40af" },
];

