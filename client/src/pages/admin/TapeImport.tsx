import { useState, useCallback, useRef } from "react";
import { Upload, ArrowRight, Eye, CheckCircle2, AlertTriangle, X, RefreshCw, Layers } from "lucide-react";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { PanelCard } from "@/components/cards/PanelCard";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import type { LoanRecord } from "@/data/types/loanRecord";
import { CSV_COLUMN_MAP } from "@/data/types/loanRecord";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3 | 4;

const REQUIRED_FIELDS: (keyof LoanRecord)[] = ["tvm", "upb", "rate", "fico", "ltv"];

const CANONICAL_FIELDS: (keyof LoanRecord)[] = [
  "tvm", "upb", "rate", "loanAmount", "fico", "ltv", "cltv", "dti",
  "product", "purpose", "occupancy", "propertyType", "loanType",
  "term", "units", "firstPaymentDate", "originationYear",
  "stateName", "countyName", "city", "status", "buyerId", "sellerId",
  "basePrice", "finalPrice",
];

type FieldMapping = Record<string, keyof LoanRecord | "">;

function parseCsvHeaders(csvText: string): string[] {
  const firstLine = csvText.split("\n")[0] ?? "";
  return firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
}

function parseCsvRows(csvText: string): Record<string, string>[] {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1, 11).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

function autoSuggest(header: string): keyof LoanRecord | "" {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, field] of Object.entries(CSV_COLUMN_MAP)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) return field;
  }
  return "";
}

function WizardStepBadge({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
        done ? "bg-emerald-500 text-white" : active ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-500"
      )}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span className={cn("text-sm font-medium hidden sm:block", active ? "text-sky-700" : done ? "text-emerald-700" : "text-slate-400")}>{label}</span>
    </div>
  );
}

const PREVIEW_COLUMNS = (headers: string[]) => headers.slice(0, 8).map((h) =>
  sortableColumn<Record<string, string>>(h, h, { cell: ({ getValue }) => <span className="truncate text-xs">{String(getValue() ?? "")}</span> })
);

export default function TapeImport() {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      setCsvText(text);
      const hdrs = parseCsvHeaders(text);
      setHeaders(hdrs);
      const rows = parseCsvRows(text);
      setPreviewRows(rows);
      const initial: FieldMapping = {};
      for (const h of hdrs) { initial[h] = autoSuggest(h); }
      setMapping(initial);
      setWizardStep(2);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const unmappedRequired = REQUIRED_FIELDS.filter((f) => !Object.values(mapping).includes(f));
  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const totalLinesEst = csvText.split("\n").filter((l) => l.trim()).length - 1;

  function buildPreviewColumns() {
    return headers.slice(0, 8).map((h) =>
      sortableColumn<Record<string, string>>(h, h, {
        cell: ({ getValue }) => <span className="truncate text-xs max-w-[120px] block">{String(getValue() ?? "—")}</span>,
      })
    );
  }

  function handleImportConfirm() {
    setImportDone(true);
    setWizardStep(4);
  }

  function handleReset() {
    setCsvText("");
    setFileName("");
    setHeaders([]);
    setMapping({});
    setPreviewRows([]);
    setImportDone(false);
    setWizardStep(1);
  }

  return (
    <SprinkleShell stepId="2" kpis={[]}>
      <div className="space-y-4">
        {/* Wizard progress bar */}
        <PanelCard icon={Layers} title="Seller Tape Import" subtitle="Upload, map fields, preview, and confirm your loan tape import">
          <div className="flex items-center gap-2 sm:gap-4">
            <WizardStepBadge step={1} current={wizardStep} label="Upload" />
            <div className="flex-1 h-px bg-slate-200" />
            <WizardStepBadge step={2} current={wizardStep} label="Map Fields" />
            <div className="flex-1 h-px bg-slate-200" />
            <WizardStepBadge step={3} current={wizardStep} label="Preview" />
            <div className="flex-1 h-px bg-slate-200" />
            <WizardStepBadge step={4} current={wizardStep} label="Confirm" />
          </div>
        </PanelCard>

        {/* Step 1: Upload */}
        {wizardStep === 1 && (
          <PanelCard icon={Upload} title="Step 1 — Upload CSV Tape" subtitle="Drag and drop your seller tape CSV file, or click to browse">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-16 transition-all",
                dragOver
                  ? "border-sky-400 bg-sky-50/50 scale-[1.01]"
                  : "border-slate-200/80 bg-white/30 hover:border-sky-300 hover:bg-sky-50/30"
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100/80">
                <Upload className="h-7 w-7 text-sky-600" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-700">Drop CSV file here or click to browse</div>
                <div className="mt-1 text-xs text-slate-500">Accepts .csv files — Fannie Mae, Freddie Mac, or custom seller tapes</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          </PanelCard>
        )}

        {/* Step 2: Map Fields */}
        {wizardStep === 2 && (
          <PanelCard
            icon={ArrowRight}
            title="Step 2 — Map Fields"
            subtitle={`${fileName} · ${mappedCount}/${headers.length} fields mapped`}
            right={
              <button onClick={handleReset} type="button" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
                <RefreshCw className="h-3.5 w-3.5" /> Start over
              </button>
            }
          >
            {unmappedRequired.length > 0 && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Required fields not yet mapped: <strong>{unmappedRequired.join(", ")}</strong></span>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {headers.map((h) => {
                const val = mapping[h] ?? "";
                const isRequired = val && REQUIRED_FIELDS.includes(val as keyof LoanRecord);
                return (
                  <div key={h} className={cn("rounded-lg border p-3", isRequired ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200/70 bg-white/30")}>
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{h}</div>
                    <select
                      className="w-full rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-sky-300 focus:outline-none"
                      value={val}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [h]: e.target.value as keyof LoanRecord | "" }))}
                    >
                      <option value="">— skip —</option>
                      {CANONICAL_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                disabled={unmappedRequired.length > 0}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                  unmappedRequired.length > 0
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-200"
                )}
              >
                Preview Data <Eye className="h-4 w-4" />
              </button>
            </div>
          </PanelCard>
        )}

        {/* Step 3: Preview */}
        {wizardStep === 3 && (
          <PanelCard
            icon={Eye}
            title="Step 3 — Preview (first 10 rows)"
            subtitle={`${totalLinesEst.toLocaleString()} total rows detected in ${fileName}`}
            right={
              <div className="flex gap-2">
                <button type="button" onClick={() => setWizardStep(2)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">← Back</button>
                <button type="button" onClick={handleImportConfirm} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Import {totalLinesEst.toLocaleString()} loans
                </button>
              </div>
            }
          >
            {/* Validation summary */}
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> {mappedCount} fields mapped
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700">
                <Eye className="h-3.5 w-3.5" /> {totalLinesEst.toLocaleString()} rows detected
              </div>
              {headers.length - mappedCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  <X className="h-3.5 w-3.5" /> {headers.length - mappedCount} fields skipped
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <DataTable data={previewRows} columns={buildPreviewColumns()} height={320} stripeRows />
            </div>
          </PanelCard>
        )}

        {/* Step 4: Confirm */}
        {wizardStep === 4 && importDone && (
          <PanelCard icon={CheckCircle2} title="Step 4 — Import Complete">
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800">
                  {totalLinesEst.toLocaleString()} loans imported successfully
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  From <strong>{fileName}</strong> · {mappedCount} fields mapped
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" /> Import another tape
                </button>
                <a
                  href="/step/2"
                  className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 shadow-sm shadow-sky-200"
                >
                  View Loan Search <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </PanelCard>
        )}

        <footer className="border-t border-slate-200/70 pt-4 text-xs text-slate-500">
          <p>Tape import processes CSV files client-side. Required fields: {REQUIRED_FIELDS.join(", ")}.</p>
          <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
        </footer>
      </div>
    </SprinkleShell>
  );
}
