/** Granular loan records for Step 2 filtering and drilldown — real data from Excel */
import type { LoanStatus } from "@/data/types/loanRecord";
import realLoansRaw from "@/data/real/realLoans.json";

export type Step2Loan = {
  id: string;
  source: string;
  product: string;
  interestRate: string;
  occupancy: string;
  purpose: string;
  propertyType: string;
  loanType: string;
  state: string;
  upb: number;
  coupon: number;
  duration: number;
  status: LoanStatus;
  buyerId?: string;
  units: number;
  dti: number;
  ltv: number;
  fico: number;
};

type RealLoan = {
  tvm: string;
  source: string;
  loanAmount: number;
  upb: number;
  rate: number;
  firstPaymentDate: string;
  purpose: string;
  fico: number;
  ltv: number;
  cltv: number;
  dti: number;
  occupancy: string;
  propertyAddress: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  propertyType: string;
  units: number;
  productType: string;
  term: number;
  lienPosition: string;
  status: string;
  basePrice: number;
  ltvFicoAdj: number;
  priceAdj: number;
  otherLlpas: number;
  finalPrice: number;
  estimatedIncome: number;
  buyerId?: string;
};

function getRateBucket(rate: number): string {
  if (rate < 3) return "< 3";
  if (rate < 3.5) return "3–3.5";
  if (rate < 4) return "3.5–4";
  if (rate < 4.5) return "4–4.5";
  if (rate < 5) return "4.5–5";
  if (rate < 5.5) return "5–5.5";
  return "5.5+";
}

function getLoanType(productType: string): string {
  if (productType === "5/1 ARM" || productType === "7/1 ARM") return "ARM";
  return "Conventional";
}

function estimateDuration(term: number, rate: number): number {
  const years = term / 12;
  if (years <= 15) return Math.round((4 + rate * 0.3 + Math.random() * 0.5) * 100) / 100;
  return Math.round((6 + rate * 0.4 + Math.random() * 1.5) * 100) / 100;
}

function normalizeOccupancy(occ: string): string {
  if (occ === "Second Home") return "Second home";
  return occ;
}

const loans = (realLoansRaw as RealLoan[]).map((r, i) => ({
  id: r.tvm,
  source: r.source,
  product: r.productType,
  interestRate: getRateBucket(r.rate),
  occupancy: normalizeOccupancy(r.occupancy),
  purpose: r.purpose,
  propertyType: r.propertyType,
  loanType: getLoanType(r.productType),
  state: r.state,
  upb: r.upb,
  coupon: r.rate,
  duration: estimateDuration(r.term, r.rate),
  status: r.status as LoanStatus,
  buyerId: r.buyerId,
  units: r.units,
  dti: r.dti,
  ltv: r.ltv,
  fico: r.fico,
}));

export function generateStep2Loans(): Step2Loan[] {
  return loans;
}

export const step2Loans: Step2Loan[] = loans;
