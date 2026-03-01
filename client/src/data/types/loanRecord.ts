/** Canonical loan record for import/export and backend persistence */

export type LoanRecord = {
  id: string;
  tvm: string;

  // Geography
  stateFips?: string;
  stateName?: string;
  countyFips?: string;
  countyName?: string;
  city?: string;
  tractFips?: string;
  tractName?: string;

  // Loan characteristics
  product: string;
  purpose: "Purchase" | "Refinance";
  occupancy: "Owner" | "Investment" | "Second home";
  propertyType: string;
  loanType?: string;
  term: number;
  units: number;

  // Amounts & rates
  loanAmount: number;
  upb: number;
  rate: number;

  // Credit
  fico: number;
  ltv: number;
  cltv: number;
  dti: number;

  // Dates
  firstPaymentDate: string;

  // Pricing (optional)
  basePrice?: number;
  priceAdj?: number;
  ltvFicoAdj?: number;
  otherLlpas?: number;
  finalPrice?: number;
};

/** CSV column name (exact or normalized) → canonical field */
export const CSV_COLUMN_MAP: Record<string, keyof LoanRecord> = {
  tvm: "tvm",
  loanid: "tvm",
  loan_id: "tvm",
  "Loan ID": "tvm",
  state: "stateName",
  State: "stateName",
  statename: "stateName",
  county: "countyName",
  County: "countyName",
  city: "city",
  City: "city",
  product: "product",
  producttype: "product",
  "Product Type": "product",
  purpose: "purpose",
  Purpose: "purpose",
  occupancy: "occupancy",
  Occupancy: "occupancy",
  propertytype: "propertyType",
  property_type: "propertyType",
  "Property Type": "propertyType",
  loanamount: "loanAmount",
  loan_amount: "upb",
  upb: "upb",
  originalbalance: "upb",
  "Original Balance": "upb",
  rate: "rate",
  interestrate: "rate",
  noterate: "rate",
  "Interest Rate": "rate",
  "Note Rate": "rate",
  fico: "fico",
  FICO: "fico",
  ltv: "ltv",
  LTV: "ltv",
  cltv: "cltv",
  CLTV: "cltv",
  dti: "dti",
  DTI: "dti",
  firstpaymentdate: "firstPaymentDate",
  first_payment_date: "firstPaymentDate",
  "First Payment": "firstPaymentDate",
  term: "term",
  loanterm: "term",
  "Loan Term": "term",
  baseprice: "basePrice",
  base_price: "basePrice",
  "Base Price": "basePrice",
  finalprice: "finalPrice",
  final_price: "finalPrice",
  "Final Price": "finalPrice",
  loanAmount: "loanAmount",
  "Loan Amount": "loanAmount",
  units: "units",
};
