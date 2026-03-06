/** Step 2 loan shape (data now loaded via API, not bundled JSON) */
import type { LoanStatus } from "@/data/types/loanRecord";

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
  firstPaymentDate: string;
};

// Data is now loaded on demand from `/api/loans/search` in Step 2.
