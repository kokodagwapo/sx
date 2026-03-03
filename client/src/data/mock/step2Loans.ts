/** Granular loan records for Step 2 filtering and drilldown */
import type { LoanStatus } from "@/data/types/loanRecord";

export type Step2Loan = {
  id: string;
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
};

const interestRates = ["2–2.5", "2.5–3", "3–3.5", "3.5–4", "4–4.5", "4.5–5", "5–5.5", "5.5–6"];
const occupancies = ["Owner", "Investment", "Second home"];
const propertyTypes = ["Single-family", "Condo", "Townhouse"];
const STATUSES: LoanStatus[] = ["Available", "Allocated", "Committed", "Sold"];
const BUYER_IDS = ["BNK-001", "BNK-002", "BNK-003", "CU-001", "INS-001"];

const irCounts: Record<string, number> = {
  "2–2.5": 2, "2.5–3": 26, "3–3.5": 428, "3.5–4": 1609,
  "4–4.5": 2685, "4.5–5": 1185, "5–5.5": 251, "5.5–6": 29,
};
const stateCounts: Record<string, number> = {
  CA: 600, FL: 512, GA: 465, NY: 443, PA: 270, NC: 285, OH: 262, TX: 235,
  DE: 234, SC: 214, MD: 209, TN: 198, MA: 185, NJ: 150, VA: 190, WA: 178,
  OR: 142, AZ: 160, MI: 132, IN: 118, CO: 120, IL: 95, UT: 88,
};

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickWeighted<T>(items: [T, number][], rng: () => number): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

export function generateStep2Loans(): Step2Loan[] {
  const rng = seededRandom(12345);
  const loans: Step2Loan[] = [];
  let id = 0;

  for (const ir of interestRates) {
    const count = irCounts[ir] ?? 0;
    for (let i = 0; i < count; i++) {
      const prod = pickWeighted([
        ["30 FRM", 87], ["15 FRM", 13], ["7/1 ARM", 5], ["5/1 ARM", 3],
      ], rng);
      const purp = pickWeighted([["Purchase", 52], ["Refinance", 48]], rng);
      const lt = pickWeighted([
        ["Conventional", 59], ["Government", 41], ["Jumbo", 9],
      ], rng);
      const st = pickWeighted(
        Object.entries(stateCounts).map(([s, c]) => [s, c] as [string, number]),
        rng,
      );
      const occ = pick(occupancies, rng);
      const pt = pick(propertyTypes, rng);

      const irNum = parseFloat(ir.split("–")[0]);
      const baseUpb = 180000 + rng() * 420000;
      const coupon = irNum + rng() * 0.8;
      const duration = 5 + rng() * 18;

      const statusRoll = rng();
      const status: LoanStatus =
        statusRoll < 0.55 ? "Available" :
        statusRoll < 0.75 ? "Allocated" :
        statusRoll < 0.88 ? "Committed" : "Sold";

      const buyerId =
        status === "Allocated" || status === "Committed" || status === "Sold"
          ? pick(BUYER_IDS, rng)
          : undefined;

      const unitsRoll = rng();
      const units = unitsRoll < 0.80 ? 1 : unitsRoll < 0.92 ? 2 : unitsRoll < 0.97 ? 3 : 4;
      // DTI: typical range 18–50%, Gaussian-ish using two rng() calls
      const dtiRaw = 18 + (rng() + rng()) * 16;
      const dti = Math.round(dtiRaw * 10) / 10;

      loans.push({
        id: `loan-${++id}`,
        product: prod,
        interestRate: ir,
        occupancy: occ,
        purpose: purp,
        propertyType: pt,
        loanType: lt,
        state: st,
        upb: Math.round(baseUpb),
        coupon: Math.round(coupon * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        status,
        buyerId,
        units,
        dti,
      });
    }
  }

  return loans;
}

export const step2Loans = generateStep2Loans();
