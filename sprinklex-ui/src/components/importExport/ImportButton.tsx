import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCSV } from "@/data/csv/csvParser";
import { parseExcel } from "@/data/excel/excelParser";
import type { LoanRecord } from "@/data/types/loanRecord";

type ImportButtonProps = {
  onImport: (rows: LoanRecord[]) => void;
  className?: string;
  disabled?: boolean;
};

const ACCEPT = ".csv,.xlsx,.xls";

export function ImportButton({ onImport, className, disabled }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      if (ext === "csv") {
        const text = await file.text();
        const result = parseCSV(text);
        if (result.rows.length > 0) {
          onImport(result.rows);
          if (result.errors.length > 0) {
            console.warn("Import warnings:", result.errors);
          }
        }
      } else if (ext === "xlsx" || ext === "xls") {
        const result = await parseExcel(file);
        if (result.rows.length > 0) {
          onImport(result.rows);
          if (result.errors.length > 0) {
            console.warn("Import warnings:", result.errors);
          }
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <Upload className="h-3.5 w-3.5" strokeWidth={2} />
        Import CSV/Excel
      </button>
    </>
  );
}
