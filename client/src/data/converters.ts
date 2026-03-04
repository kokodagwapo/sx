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
    source: r.source ?? "Import",
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
    propertyAddress: r.propertyAddress,
    city: r.city ?? "",
    county: r.countyName,
    state: r.stateName ?? "",
    propertyType: r.propertyType,
    units: r.units,
    productType: r.product,
    term: r.term,
    lienPosition: r.lienPosition ?? "1st",
    status: r.status,
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

/** Convert LoanRecord to Step2Loan for display in Step 2 */
export function loanRecordToStep2Loan(r: LoanRecord, index: number): Step2Loan {
  const rate = r.rate ?? 4;
  let bucket = "4–4.5";
  if (rate < 2.5) bucket = "2–2.5";
  else if (rate < 3) bucket = "2.5–3";
  else if (rate < 3.5) bucket = "3–3.5";
  else if (rate < 4) bucket = "3.5–4";
  else if (rate < 4.5) bucket = "4–4.5";
  else if (rate < 5) bucket = "4.5–5";
  else if (rate < 5.5) bucket = "5–5.5";
  else bucket = "5.5–6";

  return {
    id: r.id ?? r.tvm ?? `loan-${index}`,
    source: r.source ?? "",
    product: r.product ?? "30 FRM",
    interestRate: bucket,
    occupancy: r.occupancy ?? "Owner",
    purpose: r.purpose ?? "Purchase",
    propertyType: r.propertyType ?? "Single-family",
    loanType: r.loanType ?? "Conventional",
    state: r.stateName ?? "CA",
    upb: r.upb ?? 0,
    coupon: rate,
    duration: r.term ?? 360,
    status: r.status ?? "Available",
    buyerId: r.buyerId,
    units: r.units ?? 1,
    dti: r.dti ?? 36,
    ltv: r.ltv ?? 80,
    fico: r.fico ?? 720,
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
    source: r.source || undefined,
    stateName: r.state,
    product: r.product,
    purpose,
    occupancy: occ,
    propertyType: r.propertyType,
    loanType: r.loanType,
    term: 360,
    units: 1,
    loanAmount: r.upb,
    upb: r.upb,
    rate: r.coupon,
    fico: r.fico ?? 720,
    ltv: r.ltv ?? 80,
    cltv: r.ltv ?? 80,
    dti: r.dti ?? 36,
    status: r.status,
    buyerId: r.buyerId,
    firstPaymentDate: new Date().toLocaleDateString("en-US"),
  };
}
