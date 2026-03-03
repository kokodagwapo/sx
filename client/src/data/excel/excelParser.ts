import * as XLSX from "xlsx";
import type { LoanRecord } from "@/data/types/loanRecord";
import { CSV_COLUMN_MAP } from "@/data/types/loanRecord";
import type { ParseResult } from "@/data/csv/csvParser";

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

/** Parse Excel file to LoanRecord[] - uses first sheet */
export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, rows: [], errors: [{ row: 0, message: "Failed to read file" }] });
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) {
          resolve({ success: false, rows: [], errors: [{ row: 0, message: "No sheet found" }] });
          return;
        }

        const json = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        if (!json.length) {
          resolve({ success: false, rows: [], errors: [{ row: 0, message: "No data found" }] });
          return;
        }

        const rawHeaders = (json[0] as unknown[]).map((h) => toString(h));
        const colToField = new Map<number, keyof LoanRecord>();

        for (let i = 0; i < rawHeaders.length; i++) {
          const h = rawHeaders[i];
          if (!h) continue;
          const field = CSV_COLUMN_MAP[h] ?? CSV_COLUMN_MAP[normalizeHeader(h)];
          if (field) colToField.set(i, field);
        }

        const errors: ParseResult["errors"] = [];
        const rows: LoanRecord[] = [];

        for (let r = 1; r < json.length; r++) {
          const cells = json[r] as unknown[];
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

          const rate = toNumber(getVal("rate"));
          const fico = toNumber(getVal("fico"));
          const ltv = toNumber(getVal("ltv"));
          const cltv = toNumber(getVal("cltv")) ?? ltv;
          const dti = toNumber(getVal("dti"));
          const term = toNumber(getVal("term")) ?? 360;

          const purpose = toString(getVal("purpose"));
          const purposeVal: "Purchase" | "Refinance" =
            /^purchase$/i.test(purpose) || /^p$/i.test(purpose) ? "Purchase" : "Refinance";

          const occupancy = toString(getVal("occupancy"));
          const occVal: "Owner" | "Investment" | "Second home" =
            /^owner|primary/i.test(occupancy) || /^o$/i.test(occupancy)
              ? "Owner"
              : /^investment|invest/i.test(occupancy) || /^i$/i.test(occupancy)
                ? "Investment"
                : "Second home";

          rows.push({
            id: `import-${rowNum}-${tvm}`,
            tvm,
            stateName: toString(getVal("stateName")),
            city: toString(getVal("city")) || undefined,
            product: toString(getVal("product")) || "30 FRM",
            purpose: purposeVal,
            occupancy: occVal,
            propertyType: toString(getVal("propertyType")) || "Single-family",
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
            basePrice: toNumber(getVal("basePrice")),
            finalPrice: toNumber(getVal("finalPrice")),
          });
        }

        resolve({ success: errors.length === 0, rows, errors });
      } catch (err) {
        resolve({
          success: false,
          rows: [],
          errors: [{ row: 0, message: err instanceof Error ? err.message : "Parse error" }],
        });
      }
    };
    reader.readAsBinaryString(file);
  });
}
