/**
 * Fannie Mae standard LLPA lookup tables (2024 basis)
 * Source: Fannie Mae Loan-Level Price Adjustment Matrix
 */

export type LtvRange = "<60" | "60-65" | "65-70" | "70-75" | "75-80" | "80-85" | "85-90" | "90-95" | "95-97";
export type FicoRange = "<620" | "620-639" | "640-659" | "660-679" | "680-699" | "700-719" | "720-739" | "740+";

/** LLPA Table 1 — LTV/FICO grid (purchase/refi, owner-occupied SFR) */
export const LLPA_LTV_FICO: Record<LtvRange, Record<FicoRange, number>> = {
  "<60":   { "<620": 0,     "620-639": 0,     "640-659": 0,     "660-679": 0,     "680-699": 0,     "700-719": 0,     "720-739": 0,     "740+": 0     },
  "60-65": { "<620": 1.500, "620-639": 1.250, "640-659": 1.000, "660-679": 0.750, "680-699": 0.500, "700-719": 0.250, "720-739": 0,     "740+": 0     },
  "65-70": { "<620": 2.000, "620-639": 1.500, "640-659": 1.250, "660-679": 0.875, "680-699": 0.625, "700-719": 0.375, "720-739": 0,     "740+": 0     },
  "70-75": { "<620": 2.500, "620-639": 2.000, "640-659": 1.500, "660-679": 1.000, "680-699": 0.750, "700-719": 0.250, "720-739": 0,     "740+": 0     },
  "75-80": { "<620": 3.000, "620-639": 2.500, "640-659": 2.000, "660-679": 1.500, "680-699": 1.000, "700-719": 0.500, "720-739": 0.250, "740+": 0     },
  "80-85": { "<620": 3.500, "620-639": 3.000, "640-659": 2.500, "660-679": 2.000, "680-699": 1.500, "700-719": 1.000, "720-739": 0.500, "740+": 0.250 },
  "85-90": { "<620": 3.750, "620-639": 3.500, "640-659": 3.000, "660-679": 2.500, "680-699": 2.000, "700-719": 1.500, "720-739": 1.000, "740+": 0.500 },
  "90-95": { "<620": 4.500, "620-639": 4.000, "640-659": 3.500, "660-679": 3.000, "680-699": 2.500, "700-719": 2.000, "720-739": 1.500, "740+": 1.000 },
  "95-97": { "<620": 5.000, "620-639": 4.500, "640-659": 4.000, "660-679": 3.500, "680-699": 3.000, "700-719": 2.500, "720-739": 2.000, "740+": 1.500 },
};

/** Hybrid ARM LLPA by LTV */
export const LLPA_HYBRID_ARM: Record<LtvRange, number> = {
  "<60":   0,
  "60-65": 0,
  "65-70": 0.250,
  "70-75": 0.250,
  "75-80": 0.250,
  "80-85": 0.500,
  "85-90": 0.500,
  "90-95": 0.500,
  "95-97": 0.500,
};

/** Investment property LLPA by LTV */
export const LLPA_INVESTMENT: Record<LtvRange, number> = {
  "<60":   1.125,
  "60-65": 1.125,
  "65-70": 1.125,
  "70-75": 1.750,
  "75-80": 2.125,
  "80-85": 2.125,
  "85-90": 2.125,
  "90-95": 2.125,
  "95-97": 2.125,
};

/** Multi-unit LLPA (2-4 units) by LTV */
export const LLPA_MULTI_UNIT: Record<LtvRange, number> = {
  "<60":   1.000,
  "60-65": 1.000,
  "65-70": 1.000,
  "70-75": 1.000,
  "75-80": 1.000,
  "80-85": 1.000,
  "85-90": 1.000,
  "90-95": 1.000,
  "95-97": 1.000,
};

/** Condo LLPA (term > 15 years) */
export const LLPA_CONDO = -0.750;

/** Self-employed LLPA */
export const LLPA_SELF_EMPLOYED = -0.500;

/** Jumbo FRM surcharge by LTV */
export const LLPA_JUMBO: Record<LtvRange, number> = {
  "<60":   0,
  "60-65": 0,
  "65-70": 0.250,
  "70-75": 0.250,
  "75-80": 0.500,
  "80-85": 0.750,
  "85-90": 1.000,
  "90-95": 1.250,
  "95-97": 1.500,
};

export function ltvRange(ltv: number): LtvRange {
  if (ltv < 60)  return "<60";
  if (ltv < 65)  return "60-65";
  if (ltv < 70)  return "65-70";
  if (ltv < 75)  return "70-75";
  if (ltv < 80)  return "75-80";
  if (ltv < 85)  return "80-85";
  if (ltv < 90)  return "85-90";
  if (ltv < 95)  return "90-95";
  return "95-97";
}

export function ficoRange(fico: number): FicoRange {
  if (fico < 620) return "<620";
  if (fico < 640) return "620-639";
  if (fico < 660) return "640-659";
  if (fico < 680) return "660-679";
  if (fico < 700) return "680-699";
  if (fico < 720) return "700-719";
  if (fico < 740) return "720-739";
  return "740+";
}

export type LlpaWaterfallRow = {
  id: string;
  label: string;
  rule: string;
  value: number;
  isFinal?: boolean;
};

export type LlpaInputLoan = {
  tvm: string;
  product: string;
  upb: number;
  rate: number;
  occupancy: "Owner" | "Investment";
  basePrice: number;
  priceAdj: number;
  ltv?: number;
  fico?: number;
  units?: number;
  propertyType?: string;
  term?: number;
  loanType?: string;
  selfEmployed?: boolean;
};

export function buildLlpaWaterfall(loan: LlpaInputLoan): LlpaWaterfallRow[] {
  const ltv = loan.ltv ?? 80;
  const fico = loan.fico ?? 720;
  const ltvBucket = ltvRange(ltv);
  const ficoBucket = ficoRange(fico);
  const isArm = loan.product.includes("ARM");
  const isJumbo = loan.loanType === "Jumbo" || loan.upb > 766_550;
  const isInvestment = loan.occupancy === "Investment";
  const isMultiUnit = (loan.units ?? 1) > 1;
  const isCondo = loan.propertyType?.toLowerCase().includes("condo") && (loan.term ?? 360) > 180;
  const isSelfEmployed = loan.selfEmployed ?? false;

  const basePrice = loan.basePrice;
  const buyupBuydown = loan.priceAdj;
  const ltvFicoAdj = -(LLPA_LTV_FICO[ltvBucket]?.[ficoBucket] ?? 0);
  const armLlpa = isArm ? -(LLPA_HYBRID_ARM[ltvBucket] ?? 0) : 0;
  const jumboLlpa = isJumbo && !isArm ? -(LLPA_JUMBO[ltvBucket] ?? 0) : 0;
  const investmentLlpa = isInvestment ? -(LLPA_INVESTMENT[ltvBucket] ?? 0) : 0;
  const multiUnitLlpa = isMultiUnit && !isInvestment ? -(LLPA_MULTI_UNIT[ltvBucket] ?? 0) : 0;
  const condoLlpa = isCondo ? LLPA_CONDO : 0;
  const selfEmpLlpa = isSelfEmployed ? LLPA_SELF_EMPLOYED : 0;

  const final = basePrice + buyupBuydown + ltvFicoAdj + armLlpa + jumboLlpa + investmentLlpa + multiUnitLlpa + condoLlpa + selfEmpLlpa;

  return [
    {
      id: "base",
      label: "Base Price",
      rule: `Product = ${loan.product} | MBS Coupon lookup`,
      value: basePrice,
    },
    {
      id: "buyup",
      label: "Buyup / Buydown Adjuster",
      rule: isArm
        ? `ARM: Spread × multiple | Net Rate ${loan.rate.toFixed(3)}%`
        : `FRM: MBS Coupon − Net Rate ${loan.rate.toFixed(3)}%`,
      value: buyupBuydown,
    },
    {
      id: "ltvfico",
      label: "LTV / FICO Adjuster (Table 1)",
      rule: `LTV ${ltvBucket} | FICO ${ficoBucket} → LLPA ${(LLPA_LTV_FICO[ltvBucket]?.[ficoBucket] ?? 0).toFixed(3)}`,
      value: ltvFicoAdj,
    },
    {
      id: "arm",
      label: "Hybrid ARM LLPA (Table 2)",
      rule: isArm ? `ARM | LTV ${ltvBucket} → ${(LLPA_HYBRID_ARM[ltvBucket] ?? 0).toFixed(3)}` : "N/A — Fixed rate product",
      value: armLlpa,
    },
    {
      id: "jumbo",
      label: "Jumbo FRM LLPA (Table 2)",
      rule: isJumbo && !isArm ? `UPB > conforming limit | LTV ${ltvBucket}` : "N/A — Conforming balance",
      value: jumboLlpa,
    },
    {
      id: "investment",
      label: "Investment Property LLPA",
      rule: isInvestment ? `Occupancy = Investment | LTV ${ltvBucket}` : "N/A — Owner occupied",
      value: investmentLlpa,
    },
    {
      id: "multiunit",
      label: "Multi-Unit LLPA",
      rule: isMultiUnit ? `Units = ${loan.units ?? 1} | LTV ${ltvBucket}` : "N/A — 1-unit property",
      value: multiUnitLlpa,
    },
    {
      id: "condo",
      label: "Condo LLPA",
      rule: isCondo ? `Condo | Term > 15 yr → (0.750)` : "N/A — Not a condo or term ≤ 15yr",
      value: condoLlpa,
    },
    {
      id: "selfemp",
      label: "Self-Employed LLPA",
      rule: isSelfEmployed ? "Self-employed borrower flag" : "N/A — W-2 borrower",
      value: selfEmpLlpa,
    },
    {
      id: "final",
      label: "Final Price",
      rule: "Sum of all adjustments",
      value: final,
      isFinal: true,
    },
  ];
}
