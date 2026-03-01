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

function row(
  tvm: string,
  product: string,
  upb: number,
  rate: number,
  occupancy: "Owner" | "Investment",
  basePrice: number,
  priceAdj: number,
  ltvFicoAdj: number,
  otherLlpas: number,
  finalPrice: number
): PricingRow {
  return {
    tvm,
    product,
    upb,
    rate,
    occupancy,
    basePrice,
    priceAdj,
    ltvFicoAdj,
    otherLlpas,
    finalPrice,
  };
}

/** Detail of Pricing for Selected Loans — data from reference image */
export const step4PricingRows: PricingRow[] = [
  row("TV381090015", "30 FRM", 461_250.0, 4.625, "Investment", 105.42, 0.275, -0.25, -3.25, 103.195),
  row("TV381120003", "30 FRM", 363_756.97, 4.125, "Owner", 102.67, 0.413, -0.5, 0, 103.583),
  row("TV381120006", "15 FRM", 383_900.0, 3.0, "Owner", 100.42, 0.92, 0.0, 0, 101.84),
  row("TV1881030174", "16 FRM", 223_461.89, 3.875, "Investment", 102.72, -0.578, -0.25, 0, 102.393),
  row("TV1881060171", "30 FRM", 424_100.0, 4.125, "Owner", 102.67, 0.413, -1.0, 0, 103.083),
  row("TV1881060268", "15 FRM", 540_000.0, 3.5, "Owner", 102.72, 0.66, 0.0, 0, 103.88),
  row("TV1881060294", "30 FRM", 212_000.0, 4.75, "Investment", 105.42, -0.183, -0.5, 0.5, 105.237),
  row("TV1881060297", "30 FRM", 256_000.0, 4.375, "Investment", 102.67, -0.962, 0.02, -3, 101.0),
  row("TV1881060300", "5/1 ARM", 318_000.0, 3.125, "Owner", 100.0, 0.62, -0.25, 0, 100.37),
  row("TV1881060303", "30 FRM", 280_000.0, 3.875, "Owner", 99.72, -1.033, 0.0, 0, 101.0),
  row("TV1881060345", "30 FRM", 123_000.0, 4.0, "Owner", 102.67, 1.1, -0.25, 0, 104.52),
  row("TV1881060408", "30 FRM", 580_000.0, 4.125, "Owner", 102.67, 0.413, -0.5, -0.5, 103.083),
  row("TV1881090009", "7/1 ARM", 356_000.0, 3.5, "Owner", 100.0, 1.337, -0.5, 0, 100.838),
  row("TV1881090021", "5/1 ARM", 238_000.0, 3.25, "Owner", 100.0, 1.12, -0.25, 0, 100.87),
  row("TV1881090027", "30 FRM", 293_600.0, 4.75, "Owner", 105.42, -0.183, -2.75, 0, 103.487),
  row("TV1881090030", "5/1 ARM", 424_100.0, 3.125, "Owner", 100.0, 0.62, 0.0, 0, 100.62),
  row("TV1881090057", "7/1 ARM", 201_750.0, 3.625, "Investment", 100.0, 2.119, -0.25, 0, 101.869),
  row("TV1881090066", "5/1 ARM", 371_500.0, 2.375, "Owner", 100.0, -2.38, -0.25, -0.25, 100.0),
  row("TV1881090090", "15 FRM", 320_500.0, 2.75, "Owner", 99.42, -0.1, 0.0, 0, 100.5),
  row("TV1881090120", "30 FRM", 229_750.0, 4.5, "Owner", 105.42, 0.732, 0.0, -3, 104.152),
  row("TV1881090132", "15 FRM", 424_000.0, 3.375, "Owner", 100.42, -0.805, 0.0, 0, 100.5),
  row("TV1881090138", "15 FRM", 350_000.0, 3.875, "Investment", 102.72, -0.578, 0.0, 0, 102.643),
  row("TV1881090162", "30 FRM", 572_500.0, 4.125, "Owner", 102.67, 0.413, -0.25, 0, 103.833),
  row("TV1881090168", "30 FRM", 346_000.0, 4.125, "Owner", 102.67, 0.413, -0.25, 0, 103.833),
  row("TV1881090180", "5/1 ARM", 323_500.0, 3.125, "Owner", 100.0, 0.62, 0.0, 0, 100.62),
  row("TV1881090198", "7/1 ARM", 424_100.0, 3.375, "Owner", 100.0, 0.556, 0.0, 0, 100.556),
];
