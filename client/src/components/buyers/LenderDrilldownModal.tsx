import { useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Building2, DollarSign, TrendingUp, BarChart2, FileText, MapPin, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchLoanAggregations, fetchLoansPage, type LoanAggregationsResponse, type LoanListItem } from "@/api/loans";

// ─── Per-lender pastel theme ──────────────────────────────────────────────────

const LENDER_THEME: Record<string, {
  headerBg: string; headerBorder: string; headerText: string; headerSub: string;
  avatarBg: string; avatarText: string;
  kpiBg: string; kpiBorder: string; kpiLabel: string;
  bar: string; barTrack: string;
  sectionBg: string; sectionBorder: string; sectionLabel: string;
  dot: string;
}> = {
  Provident: {
    headerBg:    "bg-gradient-to-br from-violet-50 to-indigo-50/60",
    headerBorder:"border-b border-violet-100",
    headerText:  "text-violet-900",
    headerSub:   "text-violet-500",
    avatarBg:    "bg-violet-100",
    avatarText:  "text-violet-600",
    kpiBg:       "bg-violet-50/60",
    kpiBorder:   "border-violet-100",
    kpiLabel:    "text-violet-500",
    bar:         "bg-violet-400",
    barTrack:    "bg-violet-100",
    sectionBg:   "bg-violet-50/40",
    sectionBorder:"border-violet-100",
    sectionLabel: "text-violet-500",
    dot:         "bg-violet-400",
  },
  Stonegate: {
    headerBg:    "bg-gradient-to-br from-amber-50 to-orange-50/60",
    headerBorder:"border-b border-amber-100",
    headerText:  "text-amber-900",
    headerSub:   "text-amber-500",
    avatarBg:    "bg-amber-100",
    avatarText:  "text-amber-600",
    kpiBg:       "bg-amber-50/60",
    kpiBorder:   "border-amber-100",
    kpiLabel:    "text-amber-500",
    bar:         "bg-amber-400",
    barTrack:    "bg-amber-100",
    sectionBg:   "bg-amber-50/40",
    sectionBorder:"border-amber-100",
    sectionLabel: "text-amber-500",
    dot:         "bg-amber-400",
  },
  "New Penn Financial": {
    headerBg:    "bg-gradient-to-br from-sky-50 to-blue-50/60",
    headerBorder:"border-b border-sky-100",
    headerText:  "text-sky-900",
    headerSub:   "text-sky-400",
    avatarBg:    "bg-sky-100",
    avatarText:  "text-sky-600",
    kpiBg:       "bg-sky-50/60",
    kpiBorder:   "border-sky-100",
    kpiLabel:    "text-sky-500",
    bar:         "bg-sky-400",
    barTrack:    "bg-sky-100",
    sectionBg:   "bg-sky-50/40",
    sectionBorder:"border-sky-100",
    sectionLabel: "text-sky-500",
    dot:         "bg-sky-400",
  },
};

const DEFAULT_THEME = {
  headerBg:    "bg-gradient-to-br from-slate-50 to-slate-100/60",
  headerBorder:"border-b border-slate-200",
  headerText:  "text-slate-800",
  headerSub:   "text-slate-400",
  avatarBg:    "bg-slate-100",
  avatarText:  "text-slate-500",
  kpiBg:       "bg-slate-50/60",
  kpiBorder:   "border-slate-100",
  kpiLabel:    "text-slate-400",
  bar:         "bg-slate-400",
  barTrack:    "bg-slate-100",
  sectionBg:   "bg-slate-50/40",
  sectionBorder:"border-slate-100",
  sectionLabel: "text-slate-400",
  dot:         "bg-slate-400",
};

const STATUS_BADGE: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Allocated: "bg-amber-100  text-amber-700  border-amber-200",
  Committed: "bg-sky-100    text-sky-700    border-sky-200",
  Sold:      "bg-slate-100  text-slate-500  border-slate-200",
};

// ─── Mini bar ─────────────────────────────────────────────────────────────────

function MiniBar({ label, count, pct, bar, track }: { label: string; count: number; pct: number; bar: string; track: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-20 shrink-0 truncate text-[11px] font-medium text-slate-500">{label}</span>
      <div className={cn("h-1.5 flex-1 rounded-full", track)}>
        <div className={cn("h-full rounded-full transition-all duration-500", bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] tabular-nums font-semibold text-slate-600">{count.toLocaleString()}</span>
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

  const { data: agg } = useQuery<LoanAggregationsResponse>({
    queryKey: ["lenderAgg", lender],
    queryFn: () => fetchLoanAggregations({ filters: { source: [lender] } }),
    staleTime: 2 * 60 * 1000,
  });

  const { data: topPage } = useQuery({
    queryKey: ["lenderTopLoans", lender],
    queryFn: () => fetchLoansPage({ limit: 250, sort: "upb:desc", filters: { source: [lender] } }),
    staleTime: 2 * 60 * 1000,
  });

  const loans: LoanListItem[] = topPage?.items ?? [];

  const totalUpb = agg?.totalUpb ?? loans.reduce((s, l) => s + l.upb, 0);
  const totalLoans = agg?.total ?? loans.length;
  const wac = agg?.wac ?? (totalUpb > 0 ? loans.reduce((s, l) => s + l.rate * l.upb, 0) / totalUpb : 0);
  const waFico = agg?.waFico ?? (totalUpb > 0 ? loans.reduce((s, l) => s + l.fico * l.upb, 0) / totalUpb : 0);
  const waLtv = agg?.waLtv ?? (totalUpb > 0 ? loans.reduce((s, l) => s + l.ltv * l.upb, 0) / totalUpb : 0);
  const avgBal = agg?.avgBalance ?? (totalLoans > 0 ? totalUpb / totalLoans : 0);

  const stateCounts = useMemo(() => {
    const by = agg?.byState;
    if (by) return Object.entries(by).sort((a, b) => b[1] - a[1]);
    const m: Record<string, number> = {};
    for (const l of loans) m[l.state] = (m[l.state] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans, agg]);
  const productCounts = useMemo(() => {
    const by = agg?.byProductType;
    if (by) return Object.entries(by).sort((a, b) => b[1] - a[1]);
    const m: Record<string, number> = {};
    for (const l of loans) m[l.productType] = (m[l.productType] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans, agg]);
  const purposeCounts = useMemo(() => {
    const by = agg?.byPurpose;
    if (by) return Object.entries(by).sort((a, b) => b[1] - a[1]);
    const m: Record<string, number> = {};
    for (const l of loans) m[l.purpose] = (m[l.purpose] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans, agg]);
  const statusCounts = useMemo(() => {
    const by = agg?.byStatus;
    if (by) return Object.entries(by).map(([k, v]) => [k, v.count] as const).sort((a, b) => b[1] - a[1]);
    const m: Record<string, number> = {};
    for (const l of loans) m[l.status] = (m[l.status] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [loans, agg]);
  const topLoans = useMemo(() => loans.slice(0, 12), [loans]);

  const topStates  = stateCounts.slice(0, 8);
  const maxState   = topStates[0]?.[1] ?? 1;
  const maxProduct = productCounts[0]?.[1] ?? 1;

  const kpis = [
    { label: "Loans",       value: totalLoans.toLocaleString(),               icon: FileText   },
    { label: "Total UPB",   value: `$${(totalUpb / 1_000_000).toFixed(1)}M`, icon: DollarSign },
    { label: "WA Coupon",   value: `${wac.toFixed(3)}%`,                     icon: TrendingUp },
    { label: "Avg Balance", value: `$${(avgBal / 1_000).toFixed(0)}K`,       icon: BarChart2  },
    { label: "WA FICO",     value: Math.round(waFico).toString(),             icon: Percent    },
    { label: "WA LTV",      value: `${waLtv.toFixed(1)}%`,                   icon: MapPin     },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] sm:max-h-[90vh] w-full sm:max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/60 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18)]">

        {/* Header */}
        <div className={cn("flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5", theme.headerBg, theme.headerBorder)}>
          <div className="flex items-center gap-3.5">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm", theme.avatarBg)}>
              <Building2 className={cn("h-5 w-5", theme.avatarText)} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={cn("text-base font-bold tracking-tight", theme.headerText)}>{lender}</h2>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", theme.kpiBg, theme.kpiBorder, "border", theme.kpiLabel)}>
                  {loans.length.toLocaleString()} loans
                </span>
              </div>
              <p className={cn("text-[11px] mt-0.5", theme.headerSub)}>Loan Tape Drilldown · Real Portfolio Data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn("rounded-xl p-1.5 transition-colors hover:bg-black/8", theme.avatarBg)}
          >
            <X className={cn("h-4.5 w-4.5", theme.avatarText)} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-2">

            {/* ── Left column ── */}
            <div className="space-y-5">

              {/* KPI grid */}
              <div className="grid grid-cols-3 gap-2">
                {kpis.map(({ label, value, icon: Icon }) => (
                  <div key={label} className={cn("rounded-2xl border px-3 py-3 transition-shadow hover:shadow-sm", theme.kpiBg, theme.kpiBorder)}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className={cn("h-3 w-3", theme.kpiLabel)} strokeWidth={2} />
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest", theme.kpiLabel)}>{label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 tabular-nums leading-none">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status badges */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Loan Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusCounts.map(([status, count]) => (
                    <div key={status} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", STATUS_BADGE[status] ?? "bg-slate-100 text-slate-600 border-slate-200")}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      <span>{status}</span>
                      <span className="tabular-nums opacity-70">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top states */}
              <div className={cn("rounded-2xl border p-4", theme.sectionBg, theme.sectionBorder)}>
                <p className={cn("mb-3 text-[10px] font-bold uppercase tracking-widest", theme.sectionLabel)}>Top States by Loan Count</p>
                <div className="space-y-2">
                  {topStates.map(([state, count]) => (
                    <MiniBar key={state} label={state} count={count} pct={(count / maxState) * 100} bar={theme.bar} track={theme.barTrack} />
                  ))}
                </div>
              </div>

              {/* Purpose split */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Loan Purpose</p>
                <div className="flex gap-3">
                  {purposeCounts.map(([purpose, count]) => (
                    <div key={purpose} className={cn("flex-1 rounded-2xl border px-3 py-3 text-center", theme.kpiBg, theme.kpiBorder)}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wide", theme.kpiLabel)}>{purpose}</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">{count.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{((count / loans.length) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-5">

              {/* Product mix */}
              <div className={cn("rounded-2xl border p-4", theme.sectionBg, theme.sectionBorder)}>
                <p className={cn("mb-3 text-[10px] font-bold uppercase tracking-widest", theme.sectionLabel)}>Product Mix</p>
                <div className="space-y-2">
                  {productCounts.map(([product, count]) => (
                    <MiniBar key={product} label={product} count={count} pct={(count / maxProduct) * 100} bar={theme.bar} track={theme.barTrack} />
                  ))}
                </div>
              </div>

              {/* WA summary */}
              <div className={cn("rounded-2xl border p-4", theme.kpiBg, theme.kpiBorder)}>
                <p className={cn("mb-3 text-[10px] font-bold uppercase tracking-widest", theme.kpiLabel)}>Weighted Average Metrics</p>
                <div className="divide-y divide-slate-100/80 space-y-0">
                  {[
                    { label: "Coupon (WAC)",     value: `${wac.toFixed(3)}%` },
                    { label: "LTV (WA)",         value: `${waLtv.toFixed(2)}%` },
                    { label: "FICO (WA)",        value: Math.round(waFico).toString() },
                    { label: "Avg Loan Balance", value: `$${(avgBal / 1_000).toFixed(0)}K` },
                    { label: "Total UPB",        value: `$${(totalUpb / 1_000_000).toFixed(1)}M` },
                    { label: "Loan Count",       value: loans.length.toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top loans table */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Loans by UPB</p>
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full min-w-[480px] text-[11px]">
                    <thead>
                      <tr className={cn("border-b", theme.sectionBorder, theme.sectionBg)}>
                        <th className={cn("px-3 py-2.5 text-left font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>Loan ID</th>
                        <th className={cn("px-3 py-2.5 text-left font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>State</th>
                        <th className={cn("px-3 py-2.5 text-left font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>Product</th>
                        <th className={cn("px-3 py-2.5 text-right font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>UPB</th>
                        <th className={cn("px-3 py-2.5 text-right font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>Rate</th>
                        <th className={cn("px-3 py-2.5 text-left font-bold uppercase tracking-wider text-[9px]", theme.sectionLabel)}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLoans.map((loan, i) => (
                        <tr
                          key={loan.id}
                          className={cn("border-b border-slate-50/80 last:border-0 transition-colors hover:bg-slate-50/60", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}
                        >
                          <td className="px-3 py-2 font-mono text-slate-500 max-w-[80px] truncate">{loan.id}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{loan.state}</td>
                          <td className="px-3 py-2 text-slate-600">{loan.productType}</td>
                          <td className="px-3 py-2 tabular-nums text-right font-semibold text-slate-700">${(loan.upb / 1_000).toFixed(0)}K</td>
                          <td className="px-3 py-2 tabular-nums text-right text-slate-500">{loan.rate.toFixed(2)}%</td>
                          <td className="px-3 py-2">
                            <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold", STATUS_BADGE[loan.status] ?? "bg-slate-100 text-slate-600 border-slate-200")}>
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
