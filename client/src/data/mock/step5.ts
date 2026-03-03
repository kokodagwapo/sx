import type { VerticalBarDatum } from "@/components/charts/VerticalBarChart";

/** Selected Loans by Product Type — real data: 7,050 loans */
export const step5ByProduct: VerticalBarDatum[] = [
  { name: "5/1 ARM", value: 51 },
  { name: "7/1 ARM", value: 44 },
  { name: "15 FRM", value: 1450 },
  { name: "30 FRM", value: 5506 },
];

/** Selected Loans by Interest Rate — real data */
export const step5ByRate: VerticalBarDatum[] = [
  { name: "<3", value: 1132 },
  { name: "3–3.49", value: 1757 },
  { name: "3.5–3.99", value: 3282 },
  { name: "4–4.49", value: 654 },
  { name: "4.5–4.99", value: 187 },
  { name: "5–5.49", value: 35 },
  { name: "5.5+", value: 3 },
];
