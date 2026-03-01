import type { LoanRecord } from "@/data/types/loanRecord";
import type { ScheduleRow } from "@/data/mock/step7";
import type { PricingRow } from "@/data/mock/step4";
import type { Step2Loan } from "@/data/mock/step2Loans";

/** Convert LoanRecord to ScheduleRow */
export function loanToScheduleRow(r: LoanRecord): ScheduleRow {
  const occ: "Owner" | "Investment" | "Second home" =
    r.occupancy === "Investment" ? "Investment" : r.occupancy === "Second home" ? "Second home" : "Owner";
  return {
    tvm: r.tvm,
    source: "Import",
    loanAmount: r.loanAmount,
    upb: r.upb,
    rate: r.rate,
    firstPaymentDate: r.firstPaymentDate,
    purpose: r.purpose,
    fico: r.fico,
    ltv: r.ltv,
    cltv: r.cltv,
    dti: r.dti,
    occupancy: occ,
    propertyAddress: undefined,
    city: r.city ?? "",
    county: r.countyName,
    state: r.stateName ?? "",
    propertyType: r.propertyType,
    units: r.units,
    productType: r.product,
    term: r.term,
  };
}

/** Convert LoanRecord to PricingRow (with extended loan attributes for drilldown) */
export function loanToPricingRow(r: LoanRecord): PricingRow {
  const basePrice = r.basePrice ?? 103;
  const priceAdj = r.priceAdj ?? 0;
  const ltvFicoAdj = r.ltvFicoAdj ?? -1.5;
  const otherLlpas = r.otherLlpas ?? -0.1;
  const finalPrice = basePrice + priceAdj + ltvFicoAdj + otherLlpas;

  const occ: "Owner" | "Investment" =
    r.occupancy === "Investment" ? "Investment" : "Owner";

  return {
    tvm: r.tvm,
    product: r.product,
    upb: r.upb,
    rate: r.rate,
    occupancy: occ,
    basePrice,
    priceAdj,
    ltvFicoAdj,
    otherLlpas,
    finalPrice: Math.round(finalPrice * 100) / 100,
    loanAmount: r.loanAmount,
    firstPaymentDate: r.firstPaymentDate,
    purpose: r.purpose,
    fico: r.fico,
    ltv: r.ltv,
    cltv: r.cltv,
    dti: r.dti,
    city: r.city,
    state: r.stateName,
    propertyType: r.propertyType,
    units: r.units,
    term: r.term,
  };
}

/** Convert Step2Loan to LoanRecord for export */
export function step2LoanToLoanRecord(r: Step2Loan): LoanRecord {
  const purpose: "Purchase" | "Refinance" = /purchase/i.test(r.purpose) ? "Purchase" : "Refinance";
  const occ: "Owner" | "Investment" | "Second home" =
    r.occupancy === "Investment" ? "Investment" : r.occupancy === "Second home" ? "Second home" : "Owner";
  return {
    id: r.id,
    tvm: r.id,
    stateName: r.state,
    product: r.product,
    purpose,
    occupancy: occ,
    propertyType: r.propertyType,
    term: 360,
    units: 1,
    loanAmount: r.upb,
    upb: r.upb,
    rate: r.coupon,
    fico: 720,
    ltv: 80,
    cltv: 80,
    dti: 36,
    firstPaymentDate: new Date().toLocaleDateString("en-US"),
  };
}
