import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";
import type { DonutDatum } from "@/components/charts/DonutChart";

/** LTV Distribution — # of Loans by LTV range (real data: 7,050 loans) */
export const step3Ltv: HorizontalBarDatum[] = [
  { name: "95+", value: 1446 },
  { name: "90–94.9", value: 528 },
  { name: "85–89.9", value: 415 },
  { name: "80–84.9", value: 887 },
  { name: "75–79.9", value: 713 },
  { name: "70–74.9", value: 531 },
  { name: "65–69.9", value: 459 },
  { name: "60–64.9", value: 380 },
  { name: "<60", value: 1691 },
];

/** FICO Distribution — # of Loans by FICO range (real data) */
export const step3Fico: HorizontalBarDatum[] = [
  { name: "780+", value: 2191 },
  { name: "760–779", value: 1006 },
  { name: "740–759", value: 765 },
  { name: "720–739", value: 648 },
  { name: "700–719", value: 640 },
  { name: "680–699", value: 592 },
  { name: "660–679", value: 511 },
  { name: "640–659", value: 429 },
  { name: "620–639", value: 263 },
  { name: "<620", value: 5 },
];

/** DTI Distribution — # of Loans by DTI range (real data) */
export const step3Dti: HorizontalBarDatum[] = [
  { name: "45+", value: 326 },
  { name: "40–44", value: 505 },
  { name: "35–39", value: 4258 },
  { name: "30–34", value: 625 },
  { name: "25–29", value: 579 },
  { name: "20–24", value: 412 },
  { name: "<20", value: 345 },
];

/** Product Distribution — real data: 30FRM 78.1%, 15FRM 20.6%, ARM 1.3% */
export const step3Product: DonutDatum[] = [
  { name: "30 FRM", value: 78.1 },
  { name: "15 FRM", value: 20.6 },
  { name: "5/1 ARM", value: 0.7 },
  { name: "7/1 ARM", value: 0.6 },
];

/** Occupancy Distribution — Owner 92.8%, Investment 5.7%, Second Home 1.5% */
export const step3Occupancy: DonutDatum[] = [
  { name: "Owner", value: 92.8 },
  { name: "Investment", value: 5.7 },
  { name: "Second Home", value: 1.5 },
];

/** Loan Purpose Distribution — Refinance 64.6%, Purchase 35.4% */
export const step3Purpose: DonutDatum[] = [
  { name: "Refinance", value: 64.6 },
  { name: "Purchase", value: 35.4 },
];
