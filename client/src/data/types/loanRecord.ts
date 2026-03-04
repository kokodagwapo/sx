/** Canonical loan record for import/export and backend persistence */

export type LoanStatus = "Available" | "Allocated" | "Committed" | "Sold";

export type LoanRecord = {
  id: string;
  tvm: string;
  source?: string;

  // Transaction tracking (BRD §2.2.4)
  status?: LoanStatus;
  buyerId?: string;
  sellerId?: string;

  // Geography
  stateFips?: string;
  stateName?: string;
  countyFips?: string;
  countyName?: string;
  city?: string;
  tractFips?: string;
  tractName?: string;
  propertyAddress?: string;
  zip?: string;

  // Loan characteristics
  product: string;
  purpose: "Purchase" | "Refinance";
  occupancy: "Owner" | "Investment" | "Second home";
  propertyType: string;
  loanType?: string;
  lienPosition?: string;
  term: number;
  units: number;
  selfEmployed?: boolean;

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
  originationYear?: number;

  // Pricing (optional)
  basePrice?: number;
  priceAdj?: number;
  ltvFicoAdj?: number;
  otherLlpas?: number;
  finalPrice?: number;
};

/** CSV column name (exact or normalized) → canonical field */
export const CSV_COLUMN_MAP: Record<string, keyof LoanRecord> = {
  // Loan ID / TVM
  tvm: "tvm",
  loanid: "tvm",
  loan_id: "tvm",
  "Loan ID": "tvm",
  id: "tvm",

  // Source / Seller
  source: "source",
  Source: "source",
  seller: "source",
  Seller: "source",
  "Seller Name": "source",
  sellername: "source",
  originator: "source",
  Originator: "source",

  // Geography
  state: "stateName",
  State: "stateName",
  statename: "stateName",
  county: "countyName",
  County: "countyName",
  countyname: "countyName",
  city: "city",
  City: "city",
  propertyaddress: "propertyAddress",
  property_address: "propertyAddress",
  "Property Address": "propertyAddress",
  address: "propertyAddress",
  Address: "propertyAddress",
  zip: "zip",
  zipcode: "zip",
  zip_code: "zip",
  "Zip Code": "zip",
  ZIP: "zip",
  postalcode: "zip",

  // Loan characteristics
  product: "product",
  producttype: "product",
  "Product Type": "product",
  purpose: "purpose",
  Purpose: "purpose",
  loanpurpose: "purpose",
  "Loan Purpose": "purpose",
  occupancy: "occupancy",
  Occupancy: "occupancy",
  occupancytype: "occupancy",
  propertytype: "propertyType",
  property_type: "propertyType",
  "Property Type": "propertyType",
  loantype: "loanType",
  loan_type: "loanType",
  "Loan Type": "loanType",
  lienposition: "lienPosition",
  lien_position: "lienPosition",
  "Lien Position": "lienPosition",
  lien: "lienPosition",
  term: "term",
  loanterm: "term",
  "Loan Term": "term",
  originalterm: "term",
  units: "units",
  numberofunits: "units",
  "Number of Units": "units",

  // Amounts
  loanamount: "loanAmount",
  loanAmount: "loanAmount",
  "Loan Amount": "loanAmount",
  loan_amount: "loanAmount",
  upb: "upb",
  UPB: "upb",
  originalbalance: "upb",
  "Original Balance": "upb",
  originalupb: "upb",
  "Original UPB": "upb",
  currentbalance: "upb",
  "Current Balance": "upb",
  unpaidbalance: "upb",
  "Unpaid Balance": "upb",

  // Rate
  rate: "rate",
  Rate: "rate",
  interestrate: "rate",
  interest_rate: "rate",
  "Interest Rate": "rate",
  noterate: "rate",
  note_rate: "rate",
  "Note Rate": "rate",
  coupon: "rate",
  Coupon: "rate",
  couponrate: "rate",
  "Coupon Rate": "rate",

  // Credit
  fico: "fico",
  FICO: "fico",
  ficoscore: "fico",
  "FICO Score": "fico",
  creditscore: "fico",
  "Credit Score": "fico",
  ltv: "ltv",
  LTV: "ltv",
  loantovalue: "ltv",
  "Loan to Value": "ltv",
  cltv: "cltv",
  CLTV: "cltv",
  combinedltv: "cltv",
  "Combined LTV": "cltv",
  dti: "dti",
  DTI: "dti",
  debttoincome: "dti",
  "Debt to Income": "dti",

  // Dates
  firstpaymentdate: "firstPaymentDate",
  first_payment_date: "firstPaymentDate",
  "First Payment": "firstPaymentDate",
  "First Payment Date": "firstPaymentDate",
  originationdate: "firstPaymentDate",
  "Origination Date": "firstPaymentDate",
  originationyear: "originationYear",
  "Origination Year": "originationYear",
  vintage: "originationYear",
  Vintage: "originationYear",

  // Status
  status: "status",
  Status: "status",
  disposition: "status",
  Disposition: "status",
  loanstatus: "status",
  "Loan Status": "status",

  // IDs
  buyerid: "buyerId",
  buyer_id: "buyerId",
  "Buyer ID": "buyerId",
  sellerid: "sellerId",
  seller_id: "sellerId",
  "Seller ID": "sellerId",

  // Pricing
  baseprice: "basePrice",
  base_price: "basePrice",
  "Base Price": "basePrice",
  finalprice: "finalPrice",
  final_price: "finalPrice",
  "Final Price": "finalPrice",
};
