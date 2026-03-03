import type { LoanStatus } from "@/data/types/loanRecord";

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

function row(
  tvm: string,
  source: string,
  loanAmount: number,
  upb: number,
  rate: number,
  firstPaymentDate: string,
  purpose: "Purchase" | "Refinance",
  fico: number,
  ltv: number,
  cltv: number,
  dti: number,
  occupancy: "Owner" | "Investment" | "Second home",
  propertyAddress: string,
  city: string,
  county: string,
  state: string,
  propertyType: string,
  units: number,
  productType: string,
  term: number,
  lienPosition?: string
): ScheduleRow {
  return {
    tvm,
    source,
    loanAmount,
    upb,
    rate,
    firstPaymentDate,
    purpose,
    fico,
    ltv,
    cltv,
    dti,
    occupancy,
    propertyAddress,
    city,
    county,
    state,
    propertyType,
    units,
    productType,
    term,
    lienPosition,
  };
}

function withStatus(r: ScheduleRow, status: LoanStatus): ScheduleRow { return { ...r, status }; }

/** Loan Detail — data from reference image (Step 7 Schedule) */
export const step7ScheduleRows: ScheduleRow[] = [
  withStatus(row("TV9351120969", "04", 455_000, 455_000, 3.375, "6/1/2017", "Refinance", 735, 79.13, 79.13, 25.0, "Owner", "10022 Waterford Drive", "Ellicott City", "Howard", "MD", "Single-Family", 1, "15 FRM", 180, "1st"), "Available"),
  withStatus(row("TV9351150099", "04", 115_589, 115_589, 3.75, "6/1/2017", "Refinance", 726, 87.45, 87.45, 38.0, "Owner", "5055 Estonian Dr", "Fairburn", "Fulton", "GA", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV9951150102", "04", 238_804, 238_804, 4.625, "6/1/2017", "Refinance", 647, 89.44, 89.44, 30.3, "Owner", "58084 County Road 23", "Goshen", "Elkhart", "IN", "Single-Family", 1, "30 FRM", 360, "1st"), "Allocated"),
  withStatus(row("TV9951150156", "04", 153_800, 153_800, 4.25, "6/1/2017", "Refinance", 732, 94.7, 94.7, 37.53, "Owner", "8455 Cox Rd", "West Chester", "Butler", "OH", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV9951150096", "04", 69_190, 69_190, 4.625, "6/1/2017", "Refinance", 616, 85.0, 85.0, 34.71, "Owner", "401 N 3Rd St", "Elwood", "Madison", "IN", "Single-Family", 1, "30 FRM", 360, "2nd"), "Committed"),
  withStatus(row("TV11151150045", "04", 259_462, 259_462, 3.125, "6/1/2017", "Refinance", 684, 85.0, 85.0, 34.37, "Owner", "6284 Chelsea Road", "Columbiana", "Shelby", "AL", "Single-Family", 1, "15 FRM", 180, "1st"), "Available"),
  withStatus(row("TV11151150009", "04", 177_342, 177_342, 3.875, "6/1/2017", "Refinance", 669, 96.03, 96.03, 38.0, "Owner", "4901 Magazine St.", "Lake Charles", "Calcasieu Parish", "LA", "Single-Family", 1, "30 FRM", 324, "1st"), "Sold"),
  withStatus(row("TV10251150201", "04", 242_755, 242_755, 4.125, "6/1/2017", "Refinance", 484, 97.38, 97.88, 38.0, "Owner", "1172 Mt Vernon Ln", "Mount Juliet", "Wilson", "TN", "PUD", 1, "30 FRM", 360, "1st"), "Allocated"),
  withStatus(row("TV20525112051", "04", 100_000, 100_000, 4.75, "6/1/2017", "Refinance", 794, 50.0, 50.0, 39.87, "Investment", "6908 Ne 91St Ave", "Vancouver", "Clark", "WA", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV7851150024", "04", 81_000, 81_000, 3.875, "6/1/2017", "Refinance", 650, 50.63, 50.63, 30.09, "Owner", "1231 Sullivan Dr", "Cedar Hill", "Dallas", "TX", "Single-Family", 1, "30 FRM", 240, "1st"), "Available"),
  withStatus(row("TV9351150195", "04", 236_568, 236_568, 3.75, "6/1/2017", "Refinance", 752, 93.0, 93.0, 23.1, "Owner", "38 Mertz Ave", "Hillside", "Union", "NJ", "Single-Family", 1, "30 FRM", 360, "1st"), "Committed"),
  withStatus(row("TV15651150033", "04", 172_000, 172_000, 5.625, "6/1/2017", "Refinance", 672, 80.0, 80.0, 36.36, "Owner", "8440 Sw Curry Dr #D", "Wilsonville", "Clackamas", "OR", "Condominium", 1, "30 FRM", 360, "1st"), "Sold"),
  withStatus(row("TV20525103015", "04", 135_009.5, 135_009.5, 4.5, "6/1/2017", "Purchase", 634, 96.5, 96.5, 49.61, "Owner", "1436 Meggan St", "Blackfoot", "Bingham", "ID", "Townhouse", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV20525112049", "04", 268_111, 268_111, 4.375, "6/1/2017", "Refinance", 678, 85.0, 85.0, 46.21, "Owner", "6861 Kidder Dr", "Denver", "Denver", "CO", "Single-Family", 1, "30 FRM", 360, "1st"), "Allocated"),
  withStatus(row("TV15351150033", "04", 101_500, 101_500, 3.375, "6/1/2017", "Refinance", 627, 15.86, 15.86, 49.12, "Second home", "800 S Able Street 209", "Milpitas", "Santa Clara", "CA", "Condominium", 1, "15 FRM", 120, "2nd"), "Available"),
  withStatus(row("TV20525112024", "04", 103_920, 103_920, 4.2, "6/1/2017", "Purchase", 808, 80.0, 80.0, 15.44, "Second home", "1751 Yale", "Burley", "Cassia", "ID", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV23465115004", "04", 108_872, 108_872, 4.25, "6/1/2017", "Refinance", 704, 82.31, 82.31, 32.72, "Owner", "6700 Roswell Rd", "Atlanta", "Fulton", "GA", "Single-Family", 1, "30 FRM", 360, "1st"), "Committed"),
  withStatus(row("TV16551120255", "04", 134_355, 134_355, 3.875, "6/1/2017", "Refinance", 732, 75.48, 98.14, 20.09, "Owner", "245 Cherry Ave", "Watertown", "Litchfield", "CT", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV25445112003", "04", 284_648, 284_648, 4.0, "6/1/2017", "Purchase", 703, 96.5, 96.5, 54.61, "Owner", "7985 Flager Cir", "Manassas", "Prince William", "VA", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV25445112009", "04", 370_500, 370_500, 3.99, "6/1/2017", "Purchase", 793, 95.0, 95.0, 35.82, "Owner", "42637 New Dawn Ter", "Ashburn", "Loudoun", "VA", "Townhouse", 1, "30 FRM", 360, "1st"), "Allocated"),
  withStatus(row("TV25445112015", "04", 432_000, 432_000, 4.0, "6/1/2017", "Purchase", 795, 80.0, 80.0, 25.49, "Owner", "12641 Victory Lakes Loop", "Bristow", "Prince William", "VA", "PUD", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV25445112021", "04", 240_000, 240_000, 4.125, "6/1/2017", "Refinance", 794, 80.0, 80.0, 38.0, "Owner", "1493 Timber Ridge Rd", "Woodstock", "Cherokee", "GA", "Single-Family", 1, "30 FRM", 360, "1st"), "Sold"),
  withStatus(row("TV25445112027", "04", 350_000, 350_000, 4.125, "6/1/2017", "Purchase", 794, 80.0, 80.0, 38.0, "Owner", "2728 N 26th Pl", "Phoenix", "Maricopa", "AZ", "Single-Family", 1, "30 FRM", 360, "1st"), "Available"),
  withStatus(row("TV25445112033", "04", 360_000, 360_000, 3.375, "6/1/2017", "Refinance", 794, 80.0, 80.0, 38.0, "Owner", "600 S Curson Ave W Apt 1L", "Los Angeles", "Los Angeles", "CA", "Condominium", 1, "30 FRM", 360, "1st"), "Committed"),
];

export type KpiDrilldown = {
  label: string;
  value: string;
  definition: string;
  insights: string[];
};

export const step7KpiDrilldown: Record<string, KpiDrilldown> = {
  upb: {
    label: "Total Unpaid Principal Balance (UPB)",
    value: "1,534,248,974",
    definition: "Sum of outstanding principal across all selected loans in the schedule.",
    insights: ["Key portfolio size metric for pricing and risk.", "Drives interest income projections."],
  },
  loans: {
    label: "Total Loans Meeting Criteria",
    value: "6,293",
    definition: "Count of loans that pass the current filter and selection criteria.",
    insights: ["Granularity indicator for portfolio diversification."],
  },
  coupon: {
    label: "Weighted Average Coupon*",
    value: "4.13",
    definition: "Interest rate weighted by principal balance across selected loans.",
    insights: ["*Selected Loans. Reflects contractual yield."],
  },
  bey: {
    label: "Bond Equivalent Yield*",
    value: "3.73",
    definition: "Annualized yield on bond-equivalent basis for selected loans.",
    insights: ["*Selected Loans. Standardized for fixed-income comparison."],
  },
  duration: {
    label: "Weighted Average Duration*",
    value: "7.51",
    definition: "Interest-rate sensitivity; years to repricing.",
    insights: ["*Selected Loans. Key for rate risk management."],
  },
  price: {
    label: "Weighted Price Indication**",
    value: "103.05",
    definition: "Indicative market price as % of par for selected pool.",
    insights: ["**Teraverde Indicative Pricing. For valuation reference."],
  },
};
