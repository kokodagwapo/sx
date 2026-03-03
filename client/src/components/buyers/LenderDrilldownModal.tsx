import { useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Building2, DollarSign, TrendingUp, BarChart2, FileText, MapPin, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { step2Loans } from "@/data/mock/step2Loans";

// ─── Per-lender color config ──────────────────────────────────────────────────

const LENDER_THEME: Record<string, {
  accent: string; accentText: string; bg: string; border: string;
  bar: string; chip: string; chipText: string;
}> = {
  Provident: {
    accent: "bg-sky-600", accentText: "text-white",
    bg: "bg-sky-50", border: "border-sky-200",
    bar: "bg-sky-500", chip: "bg-sky-100", chipText: "text-sky-700",
  },
  Stonegate: {
    accent: "bg-amber-500", accentText: "text-white",
    bg: "bg-amber-50", border: "border-amber-200",
    bar: "bg-amber-500", chip: "bg-amber-100", chipText: "text-amber-700",
  },
  "New Penn Financial": {
    accent: "bg-rose-600", accentText: "text-white",
    bg: "bg-rose-50", border: "border-rose-200",
    bar: "bg-rose-500", chip: "bg-rose-100", chipText: "text-rose-700",
  },
};

const DEFAULT_THEME = {
  accent: "bg-slate-600", accentText: "text-white",
  bg: "bg-slate-50", border: "border-slate-200",
  bar: "bg-slate-500", chip: "bg-slate-100", chipText: "text-slate-700",
};

const STATUS_BADGE: Record<string, string> = {
  Available:  "bg-emerald-100 text-emerald-700",
  Allocated:  "bg-amber-100  text-amber-700",
  Committed:  "bg-sky-100    text-sky-700",
  Sold:       "bg-slate-100  text-slate-600",
};

// ─── Mini horizontal bar ─────────────────────────────────────────────────────

function MiniBar({ label, count, pct, bar }: { label: string; count: number; pct: number; bar: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 truncate text-[11px] text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-600">{count.toLocaleString()}</span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function LenderDrilldownModal({
  lender, onClose,
}: {
  lender: string;
  onClose: () => void;
}) {
  const theme = LENDER_THEME[lender] ?? DEFAULT_THEME;

  const loans = useMemo(
    () => step2Loans.filter((l) => l.source === lender),
    [lender],
  );

  const totalUpb = useMemo(() => loans.reduce((s, l) => s + l.upb, 0), [loans]);
  const wac      = totalUpb > 0 ? loans.reduce((s, l) => s + l.coupon * l.upb, 0) / totalUpb : 0;
  const waFico   = loans.length > 0 ? loans.reduce((s, l) => s + l.fico, 0) / loans.length : 0;
  const waLtv    = loans.length > 0 ? loans.reduce((s, l) => s + l.ltv, 0) / loans.length : 0;
  const avgBal   = loans.length > 0 ? totalUpb / loans.length : 0;

  const stateCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of loans) m[l.state] = (m[l.state] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans]);

  const productCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of loans) m[l.product] = (m[l.product] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans]);

  const purposeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of loans) m[l.purpose] = (m[l.purpose] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans]);

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of loans) m[l.status] = (m[l.status] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans]);

  const topLoans = useMemo(
    () => [...loans].sort((a, b) => b.upb - a.upb).slice(0, 12),
    [loans],
  );

  const topStates   = stateCounts.slice(0, 8);
  const maxState    = topStates[0]?.[1] ?? 1;
  const maxProduct  = productCounts[0]?.[1] ?? 1;

  const kpis = [
    { label: "Loans",      value: loans.length.toLocaleString(),             icon: FileText    },
    { label: "Total UPB",  value: `$${(totalUpb / 1_000_000).toFixed(1)}M`, icon: DollarSign  },
    { label: "WA Coupon",  value: `${wac.toFixed(3)}%`,                      icon: TrendingUp  },
    { label: "Avg Balance",value: `$${(avgBal / 1_000).toFixed(0)}K`,        icon: BarChart2   },
    { label: "WA FICO",    value: Math.round(waFico).toString(),              icon: Percent     },
    { label: "WA LTV",     value: `${waLtv.toFixed(1)}%`,                    icon: MapPin      },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className={cn("flex items-center justify-between gap-3 px-6 py-4", theme.accent)}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Building2 className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className={cn("text-base font-bold", theme.accentText)}>{lender}</h2>
              <p className={cn("text-[11px] opacity-75", theme.accentText)}>Data Source · Loan Tape Drilldown</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

            {/* ── Left ── */}
            <div className="space-y-5">

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2.5">
                {kpis.map(({ label, value, icon: Icon }) => (
                  <div key={label} className={cn("rounded-xl border px-3 py-2.5", theme.bg, theme.border)}>
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className={cn("h-3 w-3", theme.chipText)} strokeWidth={2} />
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide", theme.chipText)}>{label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Loan Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusCounts.map(([status, count]) => (
                    <div key={status} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_BADGE[status] ?? "bg-slate-100 text-slate-600")}>
                      <span>{status}</span>
                      <span className="opacity-60">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top states */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Top States by Loan Count</p>
                <div className="space-y-1.5">
                  {topStates.map(([state, count]) => (
                    <MiniBar key={state} label={state} count={count} pct={(count / maxState) * 100} bar={theme.bar} />
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Loan Purpose</p>
                <div className="flex gap-3">
                  {purposeCounts.map(([purpose, count]) => (
                    <div key={purpose} className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
                      <p className="text-xs font-bold text-slate-700">{purpose}</p>
                      <p className="text-lg font-bold text-slate-800 mt-0.5">{count.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{((count / loans.length) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right ── */}
            <div className="space-y-5">

              {/* Product mix */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Mix</p>
                <div className="space-y-1.5">
                  {productCounts.map(([product, count]) => (
                    <MiniBar key={product} label={product} count={count} pct={(count / maxProduct) * 100} bar={theme.bar} />
                  ))}
                </div>
              </div>

              {/* WA metrics summary */}
              <div className={cn("rounded-xl border p-4 space-y-2", theme.bg, theme.border)}>
                <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", theme.chipText)}>
                  Weighted Average Metrics
                </p>
                {[
                  { label: "Coupon (WAC)",    value: `${wac.toFixed(3)}%` },
                  { label: "LTV (WA)",        value: `${waLtv.toFixed(2)}%` },
                  { label: "FICO (WA)",       value: Math.round(waFico).toString() },
                  { label: "Avg Loan Balance",value: `$${(avgBal / 1_000).toFixed(0)}K` },
                  { label: "Total UPB",       value: `$${(totalUpb / 1_000_000).toFixed(1)}M` },
                  { label: "Loan Count",      value: loans.length.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-slate-500">{label}</span>
                    <span className="text-[11px] font-bold text-slate-800 tabular-nums">{value}</span>
                  </div>
                ))}
              </div>

              {/* Top loans table */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Loans by UPB</p>
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Loan ID</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">State</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Product</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-400">UPB</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-400">Rate</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLoans.map((loan, i) => (
                        <tr
                          key={loan.id}
                          className={cn("border-b border-slate-50 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/40")}
                        >
                          <td className="px-3 py-1.5 font-mono text-slate-600 max-w-[80px] truncate">{loan.id}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700">{loan.state}</td>
                          <td className="px-3 py-1.5 text-slate-600">{loan.product}</td>
                          <td className="px-3 py-1.5 tabular-nums text-right text-slate-700">${(loan.upb / 1_000).toFixed(0)}K</td>
                          <td className="px-3 py-1.5 tabular-nums text-right text-slate-600">{loan.coupon.toFixed(2)}%</td>
                          <td className="px-3 py-1.5">
                            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", STATUS_BADGE[loan.status] ?? "bg-slate-100 text-slate-600")}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {loans.length > 12 && (
                  <p className="mt-1.5 text-[10px] text-slate-400 text-right">
                    Showing top 12 of {loans.length.toLocaleString()} loans
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
