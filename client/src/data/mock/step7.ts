import type { LoanStatus } from "@/data/types/loanRecord";
import step7SampleRaw from "@/data/real/realLoans.json";

export type ScheduleRow = {
  tvm: string;
  source?: string;
  loanAmount: number;
  upb: number;
  rate: number;
  firstPaymentDate: string;
  purpose: "Purchase" | "Refinance";
  fico: number;
  ltv: number;
  cltv: number;
  dti: number;
  occupancy: "Owner" | "Investment" | "Second home";
  propertyAddress?: string;
  city: string;
  county?: string;
  state: string;
  propertyType: string;
  units: number;
  productType: string;
  term: number;
  lienPosition?: string;
  status?: LoanStatus;
};

type RealSampleLoan = {
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
  buyerId?: string;
};

function normalizeOccupancy(occ: string): "Owner" | "Investment" | "Second home" {
  if (occ === "Investment") return "Investment";
  if (occ === "Second Home") return "Second home";
  return "Owner";
}

export const step7ScheduleRows: ScheduleRow[] = (step7SampleRaw as RealSampleLoan[]).map((r) => ({
  tvm: r.tvm,
  source: r.source,
  loanAmount: r.loanAmount,
  upb: r.upb,
  rate: r.rate,
  firstPaymentDate: r.firstPaymentDate,
  purpose: r.purpose as "Purchase" | "Refinance",
  fico: r.fico,
  ltv: r.ltv,
  cltv: r.cltv,
  dti: r.dti,
  occupancy: normalizeOccupancy(r.occupancy),
  propertyAddress: r.propertyAddress,
  city: r.city,
  county: r.county,
  state: r.state,
  propertyType: r.propertyType,
  units: r.units,
  productType: r.productType,
  term: r.term,
  lienPosition: r.lienPosition || "1st",
  status: r.status as LoanStatus,
}));

export type KpiDrilldown = {
  label: string;
  value: string;
  definition: string;
  insights: string[];
};

export const step7KpiDrilldown: Record<string, KpiDrilldown> = {
  upb: {
    label: "Total Unpaid Principal Balance (UPB)",
    value: "1,860,760,635",
    definition: "Sum of outstanding principal across all selected loans in the schedule.",
    insights: ["$1.861B across 7,050 loans from three lenders.", "Provident $710.8M | Stonegate $209.1M | New Penn $940.9M."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "7,050",
    definition: "Count of loans that pass the current filter and selection criteria.",
    insights: ["7,050 real loans across 49 states.", "Avg balance $264K; strong geographic diversification."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "3.50",
    definition: "Interest rate weighted by principal balance across selected loans.",
    insights: ["*Selected Loans. Reflects contractual yield.", "Low-rate 2016 vintage pool."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.17",
    definition: "Annualized yield on bond-equivalent basis for selected loans.",
    insights: ["*Selected Loans. Standardized for fixed-income comparison.", "WAC minus 0.33% servicing spread."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "6.80",
    definition: "Interest-rate sensitivity; years to repricing.",
    insights: ["*Selected Loans. Key for rate risk management.", "20.6% 15 FRM lowers duration vs. pure 30 FRM pool."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "100.71",
    definition: "Indicative market price as % of par for selected pool.",
    insights: ["**Teraverde Indicative Pricing. For valuation reference.", "Near-par pricing; WA Price 100.707."],
  },
};
