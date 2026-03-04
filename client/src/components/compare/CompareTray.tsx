import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, GitCompare, Trash2, Layers, ArrowLeftRight,
  ChevronDown, ChevronUp, BookmarkPlus,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import type { Step2Loan } from "@/data/mock/step2Loans";

const STATUS_DOT: Record<string, string> = {
  Available: "bg-emerald-500",
  Allocated: "bg-amber-500",
  Committed: "bg-sky-500",
  Sold:      "bg-slate-400",
};

const FIELDS: {
  key: keyof Step2Loan;
  label: string;
  fmt: (v: Step2Loan) => string;
  better?: "hi" | "lo";
}[] = [
  { key: "product",      label: "Product",       fmt: (l) => l.product },
  { key: "status",       label: "Status",        fmt: (l) => l.status },
  { key: "state",        label: "State",         fmt: (l) => l.state },
  { key: "upb",          label: "UPB",           fmt: (l) => `$${(l.upb / 1_000).toFixed(0)}K`,  better: "hi" },
  { key: "coupon",       label: "Coupon",        fmt: (l) => `${l.coupon.toFixed(3)}%`,           better: "lo" },
  { key: "ltv",          label: "LTV",           fmt: (l) => `${l.ltv.toFixed(1)}%`,             better: "lo" },
  { key: "fico",         label: "FICO",          fmt: (l) => String(l.fico),                      better: "hi" },
  { key: "dti",          label: "DTI",           fmt: (l) => `${l.dti.toFixed(0)}%`,             better: "lo" },
  { key: "purpose",      label: "Purpose",       fmt: (l) => l.purpose },
  { key: "occupancy",    label: "Occupancy",     fmt: (l) => l.occupancy },
  { key: "propertyType", label: "Property Type", fmt: (l) => l.propertyType },
  { key: "loanType",     label: "Loan Type",     fmt: (l) => l.loanType },
  { key: "units",        label: "Units",         fmt: (l) => String(l.units) },
];

function waAvg(loans: Step2Loan[], field: keyof Step2Loan) {
  const total = loans.reduce((s, l) => s + l.upb, 0);
  if (total === 0) return 0;
  return loans.reduce((s, l) => s + (l[field] as number) * l.upb, 0) / total;
}

function fmtUPB(v: number) {
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1_000).toFixed(0)}K`;
}

const POOL_STATS: {
  label: string;
  fmt: (loans: Step2Loan[]) => string;
  raw: (loans: Step2Loan[]) => number;
  better: "hi" | "lo";
  desc: string;
}[] = [
  {
    label: "Loan Count",
    fmt: (l) => l.length.toLocaleString(),
    raw: (l) => l.length,
    better: "hi",
    desc: "Total number of loans in the pool",
  },
  {
    label: "Total UPB",
    fmt: (l) => fmtUPB(l.reduce((s, x) => s + x.upb, 0)),
    raw: (l) => l.reduce((s, x) => s + x.upb, 0),
    better: "hi",
    desc: "Aggregate unpaid principal balance",
  },
  {
    label: "WA FICO",
    fmt: (l) => waAvg(l, "fico").toFixed(0),
    raw: (l) => waAvg(l, "fico"),
    better: "hi",
    desc: "Weighted-average FICO score — higher = lower credit risk",
  },
  {
    label: "WA LTV",
    fmt: (l) => `${waAvg(l, "ltv").toFixed(1)}%`,
    raw: (l) => waAvg(l, "ltv"),
    better: "lo",
    desc: "Weighted-average loan-to-value — lower = more borrower equity",
  },
  {
    label: "WA Coupon",
    fmt: (l) => `${waAvg(l, "coupon").toFixed(3)}%`,
    raw: (l) => waAvg(l, "coupon"),
    better: "hi",
    desc: "Weighted-average interest rate — higher = more income for buyer",
  },
  {
    label: "WA DTI",
    fmt: (l) => `${waAvg(l, "dti").toFixed(1)}%`,
    raw: (l) => waAvg(l, "dti"),
    better: "lo",
    desc: "Weighted-average debt-to-income — lower = stronger borrower cash flow",
  },
  {
    label: "Avg Unit Count",
    fmt: (l) => waAvg(l, "units").toFixed(2),
    raw: (l) => waAvg(l, "units"),
    better: "hi",
    desc: "Average units per property — higher reflects more multi-family exposure",
  },
];

function LoanLevelModal({ loans, onClose }: { loans: Step2Loan[]; onClose: () => void }) {
  const { removeFromCompare } = useCompare();
  return createPortal(
    <>
      <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[1201] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50/40 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600">
              <GitCompare className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Loan Level Comparison</h2>
              <p className="text-xs text-slate-500">{loans.length} loans selected · green = best · red = worst</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

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
                      <button type="button" onClick={() => removeFromCompare(loan.id)}
                        className="rounded-md p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field) => {
                const numericVals = field.better ? loans.map((l) => l[field.key] as number) : null;
                const best  = numericVals ? (field.better === "hi" ? Math.max(...numericVals) : Math.min(...numericVals)) : null;
                const worst = numericVals ? (field.better === "hi" ? Math.min(...numericVals) : Math.max(...numericVals)) : null;
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
                        <td key={loan.id} className={cn(
                          "py-2.5 px-4 tabular-nums font-medium rounded-md transition-colors",
                          isBest  && "text-emerald-700 bg-emerald-50/60",
                          isWorst && "text-red-600 bg-red-50/50",
                          !isBest && !isWorst && "text-slate-700",
                        )}>
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

function PoolCompareModal({ pool1, pool2, onClose }: { pool1: Step2Loan[]; pool2: Step2Loan[]; onClose: () => void }) {
  const [expanded, setExpanded] = useState<1 | 2 | null>(null);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[4vh] bottom-[4vh] z-[1201] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50 to-sky-50/60 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
              <ArrowLeftRight className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Pool Comparison</h2>
              <p className="text-xs text-slate-500">
                Pool 1 ({pool1.length} loans) vs Pool 2 ({pool2.length} loans) · weighted-average metrics
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Aggregate comparison table */}
          <div className="p-6 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Portfolio Metrics Comparison</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-40 text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 sticky left-0 bg-white z-10">
                    Metric
                  </th>
                  <th className="py-2 px-4 text-left border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">Pool 1</span>
                      <span className="text-[10px] text-slate-400">· {pool1.length} loans</span>
                    </div>
                  </th>
                  <th className="py-2 px-4 text-left border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">Pool 2</span>
                      <span className="text-[10px] text-slate-400">· {pool2.length} loans</span>
                    </div>
                  </th>
                  <th className="py-2 px-4 text-left border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Delta
                  </th>
                  <th className="py-2 px-4 text-left border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-64">
                    Why It Matters
                  </th>
                </tr>
              </thead>
              <tbody>
                {POOL_STATS.map((stat) => {
                  const v1 = stat.raw(pool1);
                  const v2 = stat.raw(pool2);
                  const p1Better = stat.better === "hi" ? v1 > v2 : v1 < v2;
                  const p2Better = stat.better === "hi" ? v2 > v1 : v2 < v1;
                  const tied = v1 === v2;
                  const delta = v2 - v1;
                  const pct = v1 !== 0 ? ((delta / v1) * 100).toFixed(1) : "—";
                  const isAbsMetric = stat.label === "Loan Count" || stat.label === "Total UPB";
                  return (
                    <tr key={stat.label} className="border-b border-slate-50 hover:bg-slate-50/40 group">
                      <td className="py-3 px-3 font-semibold text-slate-600 sticky left-0 bg-white group-hover:bg-slate-50/40 z-10 whitespace-nowrap text-xs">
                        {stat.label}
                      </td>
                      <td className={cn(
                        "py-3 px-4 text-sm font-bold tabular-nums rounded-l-md",
                        !tied && p1Better ? "text-emerald-700 bg-emerald-50/70" : "text-slate-700",
                      )}>
                        {!tied && p1Better && <span className="text-[10px] mr-1">▲</span>}
                        {stat.fmt(pool1)}
                      </td>
                      <td className={cn(
                        "py-3 px-4 text-sm font-bold tabular-nums rounded-r-md",
                        !tied && p2Better ? "text-emerald-700 bg-emerald-50/70" : "text-slate-700",
                      )}>
                        {!tied && p2Better && <span className="text-[10px] mr-1">▲</span>}
                        {stat.fmt(pool2)}
                      </td>
                      <td className={cn(
                        "py-3 px-4 text-xs font-semibold tabular-nums",
                        tied ? "text-slate-400" : delta > 0 ? "text-emerald-600" : "text-red-500",
                      )}>
                        {tied ? "—" : (
                          <>
                            {delta > 0 ? "+" : ""}
                            {isAbsMetric
                              ? stat.label === "Total UPB" ? fmtUPB(Math.abs(delta)) : Math.abs(delta).toString()
                              : `${pct}%`}
                          </>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400 leading-relaxed">
                        {stat.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Loan-level drilldown for each pool */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            {([1, 2] as const).map((pn) => {
              const loans = pn === 1 ? pool1 : pool2;
              const color = pn === 1 ? "sky" : "violet";
              const isOpen = expanded === pn;
              return (
                <div key={pn} className={`rounded-xl border border-${color}-100 overflow-hidden`}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : pn)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 bg-${color}-50/50 hover:bg-${color}-50 transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full bg-${color}-500`} />
                      <span className="text-xs font-bold text-slate-700">Pool {pn} · {loans.length} loans</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="divide-y divide-slate-50">
                      {loans.map((loan) => (
                        <div key={loan.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[loan.status] ?? "bg-slate-300")} />
                            <span className="font-mono text-[11px] font-semibold text-slate-700">{loan.id}</span>
                            <span className="text-[10px] text-slate-400">{loan.product} · {loan.state}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 tabular-nums">
                            <span>{fmtUPB(loan.upb)}</span>
                            <span>FICO {loan.fico}</span>
                            <span>{loan.coupon.toFixed(3)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function CompareTray() {
  const {
    compareList, removeFromCompare, clearCompare,
    pool1, pool2, saveAsPool, clearPool,
  } = useCompare();
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [poolModalOpen, setPoolModalOpen] = useState(false);

  const hasSelection = compareList.length > 0;
  const hasPool1 = pool1.length > 0;
  const hasPool2 = pool2.length > 0;
  const canComparePools = hasPool1 && hasPool2;

  if (!hasSelection && !hasPool1 && !hasPool2) return null;

  return createPortal(
    <>
      <div className="fixed bottom-0 inset-x-0 z-[1100] flex justify-center px-4 pb-3 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white/97 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden animate-fade-in-up">

          {/* Pool status bar — only shown when a pool is saved */}
          {(hasPool1 || hasPool2) && (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
              <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Saved Pools</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {hasPool1 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/60 px-2.5 py-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-sky-700">Pool 1 · {pool1.length} loans · {fmtUPB(pool1.reduce((s,l)=>s+l.upb,0))}</span>
                    <button type="button" onClick={() => clearPool(1)} className="ml-1 text-sky-300 hover:text-sky-600 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {hasPool2 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-200/60 px-2.5 py-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-700">Pool 2 · {pool2.length} loans · {fmtUPB(pool2.reduce((s,l)=>s+l.upb,0))}</span>
                    <button type="button" onClick={() => clearPool(2)} className="ml-1 text-violet-300 hover:text-violet-600 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              {canComparePools && (
                <button
                  type="button"
                  onClick={() => setPoolModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 px-4 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-100 shrink-0"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Compare Pools
                </button>
              )}
            </div>
          )}

          {/* Selection tray */}
          {hasSelection && (
            <div className="flex items-center gap-2 px-4 py-2.5">
              <GitCompare className="h-4 w-4 text-sky-600 shrink-0" strokeWidth={2} />
              <span className="text-xs font-semibold text-slate-600 shrink-0">
                Selected ({compareList.length}/5)
              </span>

              {/* Loan chips */}
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0">
                {compareList.map((loan) => (
                  <div key={loan.id} className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 shrink-0">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[loan.status] ?? "bg-slate-300")} />
                    <span className="font-mono text-[11px] font-medium text-slate-700">{loan.id}</span>
                    <button type="button" onClick={() => removeFromCompare(loan.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={() => clearCompare()}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
                title="Clear selection"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => saveAsPool(1)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 border",
                  hasPool1
                    ? "border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200"
                    : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                )}
                title="Replace Pool 1 with current selection"
              >
                <BookmarkPlus className="h-3 w-3" strokeWidth={2.5} />
                {hasPool1 ? "Replace Pool 1" : "Save as Pool 1"}
              </button>

              <button
                type="button"
                onClick={() => saveAsPool(2)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all shrink-0 border",
                  hasPool2
                    ? "border-violet-300 bg-violet-100 text-violet-700 hover:bg-violet-200"
                    : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                )}
                title="Replace Pool 2 with current selection"
              >
                <BookmarkPlus className="h-3 w-3" strokeWidth={2.5} />
                {hasPool2 ? "Replace Pool 2" : "Save as Pool 2"}
              </button>

              <button
                type="button"
                onClick={() => setLoanModalOpen(true)}
                disabled={compareList.length < 2}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                Compare Loans
              </button>
            </div>
          )}
        </div>
      </div>

      {loanModalOpen && (
        <LoanLevelModal loans={compareList} onClose={() => setLoanModalOpen(false)} />
      )}
      {poolModalOpen && canComparePools && (
        <PoolCompareModal pool1={pool1} pool2={pool2} onClose={() => setPoolModalOpen(false)} />
      )}
    </>,
    document.body,
  );
}
