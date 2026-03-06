import { useState, useRef } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportFormat = "csv" | "excel";

type ExportButtonProps<T> = {
  data: T[];
  filename: string;
  exportCSV: (data: T[]) => string;
  exportExcel: (data: T[]) => Blob;
  onExportCSV?: (data: T[]) => string;
  onExportExcel?: (data: T[]) => Blob;
  className?: string;
  disabled?: boolean;
};

export function ExportButton<T>({
  data,
  filename,
  exportCSV,
  exportExcel,
  className,
  disabled,
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleExport = (format: ExportFormat) => {
    if (data.length === 0) return;
    if (format === "csv") {
      const csv = exportCSV(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = exportExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled || data.length === 0}
        className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        Export
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200/80 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              Export as CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              Export as Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
