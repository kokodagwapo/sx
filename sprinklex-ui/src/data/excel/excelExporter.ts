import * as XLSX from "xlsx";
import type { LoanRecord } from "@/data/types/loanRecord";
import type { ScheduleRow } from "@/data/mock/step7";
import type { PricingRow } from "@/data/mock/step4";

function recordsToSheet<T extends Record<string, unknown>>(rows: T[]): XLSX.WorkSheet {
  if (rows.length === 0) return XLSX.utils.aoa_to_sheet([[]]);
  return XLSX.utils.json_to_sheet(rows);
}

/** Export LoanRecord[] to Excel blob */
export function exportLoansToExcel(rows: LoanRecord[]): Blob {
  const ws = recordsToSheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Loans");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Export ScheduleRow[] to Excel */
export function exportScheduleToExcel(rows: ScheduleRow[]): Blob {
  const ws = recordsToSheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Loan Schedule");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Export PricingRow[] to Excel */
export function exportPricingToExcel(rows: PricingRow[]): Blob {
  const ws = recordsToSheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pricing");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Trigger browser download of Excel file */
export function downloadExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
