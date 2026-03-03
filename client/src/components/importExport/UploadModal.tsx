import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { UploadCloud, X, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCSV } from "@/data/csv/csvParser";
import { parseExcel } from "@/data/excel/excelParser";
import type { LoanRecord } from "@/data/types/loanRecord";

type Phase = "idle" | "dragging" | "parsing" | "preview" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (loans: LoanRecord[]) => void;
};

const ACCEPT = ".csv,.xlsx,.xls";

function bucketRate(rate: number): string {
  if (rate < 2.5) return "2–2.5";
  if (rate < 3)   return "2.5–3";
  if (rate < 3.5) return "3–3.5";
  if (rate < 4)   return "3.5–4";
  if (rate < 4.5) return "4–4.5";
  if (rate < 5)   return "4.5–5";
  if (rate < 5.5) return "5–5.5";
  return "5.5–6";
}

export function UploadModal({ open, onClose, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsed, setParsed] = useState<LoanRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");

  const reset = () => {
    setPhase("idle");
    setParsed([]);
    setErrorMsg("");
    setFileName("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setPhase("parsing");
    const ext = file.name.split(".").pop()?.toLowerCase();
    try {
      let rows: LoanRecord[] = [];
      if (ext === "csv") {
        const text = await file.text();
        const result = parseCSV(text);
        rows = result.rows;
      } else if (ext === "xlsx" || ext === "xls") {
        const result = await parseExcel(file);
        rows = result.rows;
      } else {
        throw new Error("Unsupported file type. Please use .csv, .xlsx, or .xls");
      }
      if (rows.length === 0) throw new Error("No valid loan rows found in file.");
      setParsed(rows);
      setPhase("preview");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse file.");
      setPhase("error");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setPhase("idle");
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleConfirm = () => {
    onImport(parsed);
    handleClose();
  };

  const topStates = Object.entries(
    parsed.reduce<Record<string, number>>((acc, r) => {
      const s = r.stateName ?? "–";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalUpb = parsed.reduce((s, r) => s + (r.upb ?? 0), 0);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <UploadCloud className="h-4 w-4 text-sky-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Import Loan Tape</p>
              <p className="text-xs text-slate-400">CSV · Excel (.xlsx / .xls)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          {(phase === "idle" || phase === "dragging") && (
            <div
              onDragOver={(e) => { e.preventDefault(); setPhase("dragging"); }}
              onDragLeave={() => setPhase("idle")}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all duration-200",
                phase === "dragging"
                  ? "border-sky-400 bg-sky-50"
                  : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                phase === "dragging" ? "bg-sky-100" : "bg-white ring-1 ring-slate-200"
              )}>
                <UploadCloud className={cn(
                  "h-6 w-6 transition-colors",
                  phase === "dragging" ? "text-sky-500" : "text-slate-400"
                )} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {phase === "dragging" ? "Drop to upload" : "Drop file here, or click to browse"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">CSV, XLSX, XLS supported</p>
              </div>
            </div>
          )}

          {phase === "parsing" && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <p className="text-sm text-slate-500">Parsing <span className="font-medium text-slate-700">{fileName}</span>…</p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-8 px-5 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-red-700">Import failed</p>
                <p className="mt-1 text-xs text-red-500">{errorMsg}</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-1 rounded-lg border border-red-200 bg-white px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {phase === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {parsed.length.toLocaleString()} loans parsed
                  </p>
                  <p className="text-xs text-emerald-600">
                    Total UPB: ${(totalUpb / 1_000_000).toFixed(1)}M · from {fileName}
                  </p>
                </div>
              </div>

              {topStates.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Top States</p>
                  <div className="space-y-1.5">
                    {topStates.map(([state, count]) => {
                      const pct = Math.round((count / parsed.length) * 100);
                      return (
                        <div key={state} className="flex items-center gap-2">
                          <span className="w-6 text-right text-xs font-mono text-slate-500">{state}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs text-slate-400">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-3">
                <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Data will populate all sections: Geography, Search, Charts, and Tables</span>
              </div>
            </div>
          )}
        </div>

        {phase === "preview" && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 transition-colors"
            >
              Import {parsed.length.toLocaleString()} Loans
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export { bucketRate };
