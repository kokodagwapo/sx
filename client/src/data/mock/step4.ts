import step4SampleRaw from "@/data/real/step4Sample.json";

export type PricingRow = {
  tvm: string;
  product: string;
  upb: number;
  rate: number;
  occupancy: "Owner" | "Investment";
  basePrice: number;
  priceAdj: number;
  ltvFicoAdj: number;
  otherLlpas: number;
  finalPrice: number;
  loanAmount?: number;
  firstPaymentDate?: string;
  purpose?: "Purchase" | "Refinance";
  fico?: number;
  ltv?: number;
  cltv?: number;
  dti?: number;
  city?: string;
  state?: string;
  propertyType?: string;
  units?: number;
  term?: number;
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
  city: string;
  state: string;
  propertyType: string;
  units: number;
  productType: string;
  term: number;
  basePrice: number;
  ltvFicoAdj: number;
  priceAdj: number;
  otherLlpas: number;
  finalPrice: number;
};

function normalizeOccupancy(occ: string): "Owner" | "Investment" {
  return occ === "Investment" ? "Investment" : "Owner";
}

export const step4PricingRows: PricingRow[] = (step4SampleRaw as RealSampleLoan[]).map((r) => ({
  tvm: r.tvm,
  product: r.productType,
  upb: r.upb,
  rate: r.rate,
  occupancy: normalizeOccupancy(r.occupancy),
  basePrice: r.basePrice,
  priceAdj: r.priceAdj,
  ltvFicoAdj: r.ltvFicoAdj,
  otherLlpas: r.otherLlpas,
  finalPrice: r.finalPrice,
  loanAmount: r.loanAmount,
  firstPaymentDate: r.firstPaymentDate,
  purpose: r.purpose as "Purchase" | "Refinance",
  fico: r.fico,
  ltv: r.ltv,
  cltv: r.cltv,
  dti: r.dti,
  city: r.city,
  state: r.state,
  propertyType: r.propertyType,
  units: r.units,
  term: r.term,
}));
