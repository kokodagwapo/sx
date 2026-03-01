import Papa from "papaparse";
import type { LoanRecord } from "@/data/types/loanRecord";
import type { ScheduleRow } from "@/data/mock/step7";
import type { PricingRow } from "@/data/mock/step4";

const LOAN_EXPORT_FIELDS: (keyof LoanRecord)[] = [
  "tvm",
  "loanAmount",
  "upb",
  "rate",
  "firstPaymentDate",
  "purpose",
  "fico",
  "ltv",
  "cltv",
  "dti",
  "occupancy",
  "city",
  "stateName",
  "propertyType",
  "units",
  "product",
  "term",
  "basePrice",
  "finalPrice",
];

/** Export LoanRecord[] to CSV string */
export function exportLoansToCSV(rows: LoanRecord[]): string {
  if (rows.length === 0) return "";

  const headers = LOAN_EXPORT_FIELDS.map((h) => (h === "stateName" ? "state" : h));
  const data = rows.map((r) =>
    LOAN_EXPORT_FIELDS.map((h) => {
      const v = r[h];
      if (v == null) return "";
      return String(v);
    })
  );

  return Papa.unparse({ fields: headers, data });
}

/** Export ScheduleRow[] to CSV */
export function exportScheduleToCSV(rows: ScheduleRow[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]) as (keyof ScheduleRow)[];
  const data = rows.map((r) => headers.map((h) => String(r[h] ?? "")));
  return Papa.unparse({ fields: headers, data });
}

/** Export PricingRow[] to CSV */
export function exportPricingToCSV(rows: PricingRow[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]) as (keyof PricingRow)[];
  const data = rows.map((r) => headers.map((h) => String(r[h] ?? "")));
  return Papa.unparse({ fields: headers, data });
}

/** Trigger browser download of CSV */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
