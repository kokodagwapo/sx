import Papa from "papaparse";
import type { LoanRecord, LoanStatus } from "@/data/types/loanRecord";
import { CSV_COLUMN_MAP } from "@/data/types/loanRecord";

export type ParseResult = {
  success: boolean;
  rows: LoanRecord[];
  errors: Array<{ row: number; column?: string; message: string }>;
};

function toNumber(val: unknown): number | undefined {
  if (val === "" || val == null) return undefined;
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  const s = String(val).replace(/[,$%]/g, "");
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
}

function toString(val: unknown): string {
  if (val == null) return "";
  return String(val).trim();
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_-]+/g, "");
}

/** Rates stored as decimals (0.035) are auto-converted to percent (3.5) */
function normalizeRate(raw: number | undefined): number | undefined {
  if (raw == null) return undefined;
  return raw > 0 && raw < 1 ? raw * 100 : raw;
}

const VALID_STATUSES = new Set<string>(["Available", "Allocated", "Committed", "Sold"]);

function normalizeStatus(val: string): LoanStatus | undefined {
  const s = val.trim();
  if (VALID_STATUSES.has(s)) return s as LoanStatus;
  const l = s.toLowerCase();
  if (l === "avail" || l === "for sale") return "Available";
  if (l === "alloc" || l === "allocated") return "Allocated";
  if (l === "commit" || l === "committed" || l === "loi") return "Committed";
  if (l === "sold" || l === "closed") return "Sold";
  return undefined;
}

export function parseCSV(csvText: string): ParseResult {
  const result = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  const errors: ParseResult["errors"] = [];
  const rows: LoanRecord[] = [];

  if (!result.data?.length) {
    return { success: false, rows: [], errors: [{ row: 0, message: "No data found" }] };
  }

  const rawHeaders = result.data[0].map((h: unknown) => toString(h));
  const colToField = new Map<number, keyof LoanRecord>();

  for (let i = 0; i < rawHeaders.length; i++) {
    const h = rawHeaders[i];
    if (!h) continue;
    const field = CSV_COLUMN_MAP[h] ?? CSV_COLUMN_MAP[normalizeHeader(h)];
    if (field) colToField.set(i, field);
  }

  for (let r = 1; r < result.data.length; r++) {
    const cells = result.data[r];
    const rowNum = r + 1;

    const getVal = (field: keyof LoanRecord): unknown => {
      for (const [col, f] of Array.from(colToField.entries())) {
        if (f === field) return cells[col];
      }
      return undefined;
    };

    const tvm = toString(getVal("tvm"));
    if (!tvm) {
      errors.push({ row: rowNum, message: "Missing TVM/loan ID" });
      continue;
    }

    const upb = toNumber(getVal("upb")) ?? toNumber(getVal("loanAmount"));
    if (upb == null || upb <= 0) {
      errors.push({ row: rowNum, column: "upb", message: "Invalid or missing UPB" });
    }

    const rate = normalizeRate(toNumber(getVal("rate")));
    const fico = toNumber(getVal("fico"));
    const ltv = toNumber(getVal("ltv"));
    const cltv = toNumber(getVal("cltv")) ?? ltv;
    const dti = toNumber(getVal("dti"));
    const term = toNumber(getVal("term")) ?? 360;

    const purpose = toString(getVal("purpose"));
    const purposeVal: "Purchase" | "Refinance" =
      /^purchase$/i.test(purpose) || /^p$/i.test(purpose) || /^purch/i.test(purpose)
        ? "Purchase"
        : "Refinance";

    const occupancy = toString(getVal("occupancy"));
    const occVal: "Owner" | "Investment" | "Second home" =
      /^owner|primary|principal/i.test(occupancy) || /^o$/i.test(occupancy)
        ? "Owner"
        : /^investment|invest|non.?owner/i.test(occupancy) || /^i$/i.test(occupancy)
          ? "Investment"
          : /^second|vacation/i.test(occupancy)
            ? "Second home"
            : "Owner";

    const sourceRaw = toString(getVal("source"));
    const statusRaw = toString(getVal("status"));
    const lienRaw = toString(getVal("lienPosition"));

    rows.push({
      id: `import-${rowNum}-${tvm}`,
      tvm,
      source: sourceRaw || undefined,
      stateName: toString(getVal("stateName")) || undefined,
      countyName: toString(getVal("countyName")) || undefined,
      city: toString(getVal("city")) || undefined,
      propertyAddress: toString(getVal("propertyAddress")) || undefined,
      zip: toString(getVal("zip")) || undefined,
      product: toString(getVal("product")) || "30 FRM",
      purpose: purposeVal,
      occupancy: occVal,
      propertyType: toString(getVal("propertyType")) || "Single-family",
      loanType: toString(getVal("loanType")) || undefined,
      lienPosition: lienRaw || "1st",
      term: Math.round(term),
      units: Math.round(toNumber(getVal("units")) ?? 1),
      loanAmount: upb ?? 0,
      upb: upb ?? 0,
      rate: rate ?? 0,
      fico: Math.round(fico ?? 700),
      ltv: ltv ?? 80,
      cltv: cltv ?? ltv ?? 80,
      dti: dti ?? 36,
      firstPaymentDate: toString(getVal("firstPaymentDate")) || new Date().toLocaleDateString("en-US"),
      originationYear: toNumber(getVal("originationYear")) ?? undefined,
      status: statusRaw ? normalizeStatus(statusRaw) : undefined,
      buyerId: toString(getVal("buyerId")) || undefined,
      sellerId: toString(getVal("sellerId")) || undefined,
      basePrice: toNumber(getVal("basePrice")),
      finalPrice: toNumber(getVal("finalPrice")),
    });
  }

  return {
    success: errors.length === 0,
    rows,
    errors,
  };
}
