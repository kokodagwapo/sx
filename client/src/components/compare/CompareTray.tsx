import { useState } from "react";
import { createPortal } from "react-dom";
import { X, GitCompare, ChevronUp, Trash2 } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import type { Step2Loan } from "@/data/mock/step2Loans";

const STATUS_DOT: Record<string, string> = {
  Available: "bg-emerald-500",
  Allocated: "bg-amber-500",
  Committed: "bg-sky-500",
  Sold: "bg-slate-400",
};

const FIELDS: { key: keyof Step2Loan; label: string; fmt: (v: Step2Loan) => string; better?: "hi" | "lo" }[] = [
  { key: "product",      label: "Product",       fmt: (l) => l.product },
  { key: "status",       label: "Status",        fmt: (l) => l.status },
  { key: "state",        label: "State",         fmt: (l) => l.state },
  { key: "upb",          label: "UPB",           fmt: (l) => `$${(l.upb / 1_000).toFixed(0)}K`,    better: "hi" },
  { key: "coupon",       label: "Coupon",        fmt: (l) => `${l.coupon.toFixed(3)}%`,             better: "lo" },
  { key: "ltv",          label: "LTV",           fmt: (l) => `${l.ltv.toFixed(1)}%`,               better: "lo" },
  { key: "fico",         label: "FICO",          fmt: (l) => String(l.fico),                        better: "hi" },
  { key: "dti",          label: "DTI",           fmt: (l) => `${l.dti.toFixed(0)}%`,               better: "lo" },
  { key: "purpose",      label: "Purpose",       fmt: (l) => l.purpose },
  { key: "occupancy",    label: "Occupancy",     fmt: (l) => l.occupancy },
  { key: "propertyType", label: "Property Type", fmt: (l) => l.propertyType },
  { key: "loanType",     label: "Loan Type",     fmt: (l) => l.loanType },
  { key: "units",        label: "Units",         fmt: (l) => String(l.units) },
];

function CompareModal({ loans, onClose }: { loans: Step2Loan[]; onClose: () => void }) {
  const { removeFromCompare } = useCompare();

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[1201] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50/40 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600">
              <GitCompare className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Loan Comparison</h2>
              <p className="text-xs text-slate-500">{loans.length} loans selected · green = best · red = worst</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-28 text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 sticky left-0 bg-white z-10">
                  Field
                </th>
                {loans.map((loan) => (
                  <th key={loan.id} className="py-2 px-4 text-left border-b border-slate-100 min-w-[140px]">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[loan.status] ?? "bg-slate-300")} />
                          <span className="font-mono font-semibold text-slate-700 text-[11px]">{loan.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{loan.status}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCompare(loan.id)}
                        className="rounded-md p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field) => {
                const numericVals = field.better
                  ? loans.map((l) => l[field.key] as number)
                  : null;
                const best = numericVals
                  ? field.better === "hi" ? Math.max(...numericVals) : Math.min(...numericVals)
                  : null;
                const worst = numericVals
                  ? field.better === "hi" ? Math.min(...numericVals) : Math.max(...numericVals)
                  : null;

                return (
                  <tr key={field.key} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                    <td className="py-2.5 px-3 font-medium text-slate-500 sticky left-0 bg-white group-hover:bg-slate-50/60 z-10 whitespace-nowrap">
                      {field.label}
                    </td>
                    {loans.map((loan) => {
                      const raw = loan[field.key] as number;
                      const isBest  = best  != null && loans.length > 1 && raw === best;
                      const isWorst = worst != null && loans.length > 1 && raw === worst && best !== worst;
                      return (
                        <td
                          key={loan.id}
                          className={cn(
                            "py-2.5 px-4 tabular-nums font-medium rounded-md transition-colors",
                            isBest  && "text-emerald-700 bg-emerald-50/60",
                            isWorst && "text-red-600 bg-red-50/50",
                            !isBest && !isWorst && "text-slate-700",
                          )}
                        >
                          {field.fmt(loan)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function CompareTray() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (compareList.length === 0) return null;

  return createPortal(
    <>
      {/* Tray */}
      <div className="fixed bottom-0 inset-x-0 z-[1100] flex justify-center px-4 pb-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] px-4 py-2.5 max-w-2xl w-full animate-fade-in-up">
          <GitCompare className="h-4 w-4 text-sky-600 shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            Compare ({compareList.length}/5)
          </span>

          {/* Loan chips */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0">
            {compareList.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 shrink-0"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[loan.status] ?? "bg-slate-300")} />
                <span className="font-mono text-[11px] font-medium text-slate-700">{loan.id}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(loan.id)}
                  className="text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => clearCompare()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
            title="Clear all"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={compareList.length < 2}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            Compare
          </button>
        </div>
      </div>

      {modalOpen && (
        <CompareModal loans={compareList} onClose={() => setModalOpen(false)} />
      )}
    </>,
    document.body,
  );
}
