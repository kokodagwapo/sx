import { useCallback, useMemo, useState } from "react";
import { Percent, MapPinned, PieChart, Target, FileText, Banknote, LayoutList, Clock, Scale, TrendingUp, CheckCircle2, Lock, AlertCircle, Tag, X, ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, UploadCloud, GitCompare, Plus } from "lucide-react";
import { ExportButton } from "@/components/importExport/ExportButton";
import { UploadModal } from "@/components/importExport/UploadModal";
import { TourBubble } from "@/components/onboarding/TourBubble";
import { useCompare } from "@/context/CompareContext";
import { exportLoansToCSV } from "@/data/csv/csvExporter";
import { exportLoansToExcel } from "@/data/excel/excelExporter";
import { step2LoanToLoanRecord, loanRecordToStep2Loan } from "@/data/converters";
import type { LoanRecord } from "@/data/types/loanRecord";
import { useLoanContext } from "@/context/LoanContext";
import type { LoanStatus } from "@/data/types/loanRecord";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import type { KpiItem } from "@/components/step/KpiStrip";
import type { FilterState, SliderState, SliderGroup } from "@/components/filters/FilterRail";
import type { VerticalBarDatum } from "@/components/charts/VerticalBarChart";
import type { DonutDatum } from "@/components/charts/DonutChart";
import { step2Loans, type Step2Loan } from "@/data/mock/step2Loans";
import { DONUT_REFERENCE_COLORS } from "@/styles/chartPalette";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<LoanStatus, { label: string; badge: string; icon: typeof CheckCircle2; dot: string }> = {
  Available:  { label: "Available",  badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  Allocated:  { label: "Allocated",  badge: "bg-amber-100/80  text-amber-700  border-amber-200",    icon: Tag,          dot: "bg-amber-500"   },
  Committed:  { label: "Committed",  badge: "bg-sky-100/80    text-sky-700    border-sky-200",       icon: Lock,         dot: "bg-sky-500"     },
  Sold:       { label: "Sold",       badge: "bg-slate-100/80  text-slate-600  border-slate-200",     icon: AlertCircle,  dot: "bg-slate-400"   },
};

const FILTER_GROUPS = [
  { section: "Product", title: "Product Type", options: ["30 FRM", "15 FRM", "7/1 ARM", "5/1 ARM"] },
  { section: "Product", title: "Occupancy", options: ["Owner", "Investment", "Second home"] },
  { section: "Product", title: "Purpose", options: ["Purchase", "Refinance"] },
  { section: "Product", title: "Property Type", options: ["Single-family", "Condo", "Townhouse"] },
  { section: "Product", title: "Loan Type", options: ["Conventional", "Government", "Jumbo"] },
  { section: "Product", title: "Status", options: ["Available", "Allocated", "Committed", "Sold"] },
  { section: "Credit", title: "LTV", options: ["<60", "60–70", "70–80", "80–90", ">90"] },
  { section: "Credit", title: "FICO", options: ["<680", "680–720", "720–760", ">760"] },
  { section: "Product", title: "State", options: ["CA", "FL", "GA", "NY", "PA", "TX", "VA", "WA", "AZ", "NJ", "CO", "IL", "OH", "NC", "MI", "DE", "SC", "MD", "TN", "MA", "IN", "UT", "OR"] },
];

const fmt$ = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : `$${(v / 1_000).toFixed(0)}K`;

const SLIDER_GROUPS: SliderGroup[] = [
  {
    field: "coupon",
    label: "Interest Rate",
    min: 2,
    max: 7,
    step: 0.25,
    format: (v) => `${v.toFixed(2)}%`,
  },
  {
    field: "upb",
    label: "Loan Amount (UPB)",
    min: 50_000,
    max: 2_000_000,
    step: 25_000,
    format: fmt$,
  },
  {
    field: "dti",
    label: "Debt-to-Income (DTI)",
    min: 10,
    max: 55,
    step: 1,
    format: (v) => `${v.toFixed(0)}%`,
  },
];

const SLIDER_DEFAULTS: SliderState = {
  coupon: [2, 7],
  upb: [50_000, 2_000_000],
  dti: [10, 55],
};

function filterLoansByField(
  loans: Step2Loan[],
  state: FilterState,
  sliderState: SliderState,
): Step2Loan[] {
  const fieldMap: Record<string, keyof Step2Loan> = {
    "Product Type": "product",
    State: "state",
    Occupancy: "occupancy",
    Purpose: "purpose",
    "Property Type": "propertyType",
    "Loan Type": "loanType",
    Status: "status",
  };
  return loans.filter((loan) => {
    // Chip-based filters
    for (const [group, selected] of Object.entries(state)) {
      if (!selected?.length) continue;
      const key = fieldMap[group];
      if (!key) continue;
      const value = loan[key];
      if (typeof value !== "string" || !selected.includes(value)) return false;
    }
    // Range slider filters
    const couponRange = sliderState["coupon"] ?? SLIDER_DEFAULTS["coupon"];
    if (loan.coupon < couponRange[0] || loan.coupon > couponRange[1]) return false;

    const upbRange = sliderState["upb"] ?? SLIDER_DEFAULTS["upb"];
    if (loan.upb < upbRange[0] || loan.upb > upbRange[1]) return false;

    const dtiRange = sliderState["dti"] ?? SLIDER_DEFAULTS["dti"];
    if (loan.dti < dtiRange[0] || loan.dti > dtiRange[1]) return false;

    return true;
  });
}

function aggregateByField(loans: Step2Loan[], field: keyof Step2Loan): VerticalBarDatum[] {
  const counts: Record<string, number> = {};
  for (const loan of loans) {
    const v = String(loan[field]);
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function aggregateDonut(loans: Step2Loan[], field: keyof Step2Loan): DonutDatum[] {
  const counts: Record<string, number> = {};
  for (const loan of loans) {
    const v = String(loan[field]);
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

const BREAKDOWN_COLORS = [
  "#4ade80", "#38bdf8", "#a78bfa", "#fb923c",
  "#f472b6", "#34d399", "#facc15", "#60a5fa",
];

function StatusBadge({ status }: { status: LoanStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function StatusSummaryBar({
  loans,
  selectedStatus,
  onStatusClick,
}: {
  loans: Step2Loan[];
  selectedStatus: LoanStatus | null;
  onStatusClick: (s: LoanStatus) => void;
}) {
  const total = loans.length;
  const byStatus = useMemo(() => {
    const counts = { Available: 0, Allocated: 0, Committed: 0, Sold: 0 };
    for (const l of loans) counts[l.status] = (counts[l.status] ?? 0) + 1;
    return counts;
  }, [loans]);

  return (
    <div className="flex flex-wrap gap-2">
      {(["Available", "Allocated", "Committed", "Sold"] as LoanStatus[]).map((s) => {
        const cfg = STATUS_CONFIG[s];
        const count = byStatus[s] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const Icon = cfg.icon;
        const isSelected = selectedStatus === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onStatusClick(s)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-sm",
              cfg.badge,
              isSelected ? "ring-2 ring-offset-1 ring-current shadow-sm" : "opacity-80 hover:opacity-100"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="font-semibold">{count.toLocaleString()}</span>
            <span className="font-medium opacity-80">{s}</span>
            <span className="text-xs opacity-60">({pct.toFixed(0)}%)</span>
            {isSelected && <span className="text-[10px] font-bold opacity-70">▼</span>}
          </button>
        );
      })}
      <span className="self-center text-[10px] text-slate-400 ml-1">Click to drill down</span>
    </div>
  );
}

function BreakdownColumn({
  title, data, total, filterGroup, onDrilldown,
}: {
  title: string;
  data: DonutDatum[];
  total: number;
  filterGroup: string;
  onDrilldown: (group: string, value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</div>
      <div className="space-y-1.5">
        {data.slice(0, 8).map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          const color = d.color ?? BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length];
          return (
            <button
              key={d.name}
              type="button"
              className="group w-full text-left"
              onClick={() => onDrilldown(filterGroup, d.name)}
            >
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors truncate max-w-[70%]">{d.name}</span>
                <span className="text-[11px] tabular-nums font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 6px ${color}66` }}
                />
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">{d.value.toLocaleString()} loans</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BreakdownDetails({
  filteredLoans, productDonut, purposeDonut, loanTypeDonut, interestRateBars, stateBars, onDrilldown,
}: {
  filteredLoans: Step2Loan[];
  productDonut: DonutDatum[];
  purposeDonut: DonutDatum[];
  loanTypeDonut: DonutDatum[];
  interestRateBars: VerticalBarDatum[];
  stateBars: VerticalBarDatum[];
  onDrilldown: (group: string, value: string) => void;
}) {
  const total = filteredLoans.length;
  const rateDonuts: DonutDatum[] = interestRateBars.map((b, i) => ({ name: b.name, value: b.value, color: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }));
  const stateDonuts: DonutDatum[] = stateBars.slice(0, 8).map((b, i) => ({ name: b.name, value: b.value, color: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }));

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      <BreakdownColumn title="Product Type" data={productDonut} total={total} filterGroup="Product Type" onDrilldown={onDrilldown} />
      <BreakdownColumn title="Purpose" data={purposeDonut} total={total} filterGroup="Purpose" onDrilldown={onDrilldown} />
      <BreakdownColumn title="Loan Type" data={loanTypeDonut} total={total} filterGroup="Loan Type" onDrilldown={onDrilldown} />
      <BreakdownColumn title="Interest Rate" data={rateDonuts} total={total} filterGroup="Interest Rate" onDrilldown={onDrilldown} />
      <BreakdownColumn title="Top States" data={stateDonuts} total={total} filterGroup="State" onDrilldown={onDrilldown} />
    </div>
  );
}

const PAGE_SIZE = 15;

type SortKey = keyof Step2Loan;

const STATUS_BORDER: Record<LoanStatus, string> = {
  Available: "border-t-emerald-400",
  Allocated: "border-t-amber-400",
  Committed: "border-t-sky-400",
  Sold:      "border-t-slate-400",
};

function StatusDrilldownPanel({
  status, loans, onClose,
}: {
  status: LoanStatus;
  loans: Step2Loan[];
  onClose: () => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("upb");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const cfg = STATUS_CONFIG[status];
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const Icon = cfg.icon;

  const totalUpb = loans.reduce((s, l) => s + l.upb, 0);
  const avgBalance = loans.length > 0 ? totalUpb / loans.length : 0;
  const wac = loans.length > 0
    ? loans.reduce((s, l) => s + l.coupon * l.upb, 0) / (totalUpb || 1)
    : 0;
  const topState = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of loans) counts[l.state] = (counts[l.state] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [loans]);

  const productBars = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of loans) c[l.product] = (c[l.product] ?? 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [loans]);

  const purposeBars = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of loans) c[l.purpose] = (c[l.purpose] ?? 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [loans]);

  const stateBars = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of loans) c[l.state] = (c[l.state] ?? 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [loans]);

  const sorted = useMemo(() => {
    return [...loans].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });
  }, [loans, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (k !== sortKey) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-sky-500" /> : <ArrowDown className="h-3 w-3 text-sky-500" />;
  };

  const showBuyer = status === "Allocated" || status === "Committed";

  return (
    <div className={cn("mt-4 rounded-xl border-t-4 border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg overflow-hidden animate-fade-in-up", STATUS_BORDER[status])}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-5 py-3.5 border-b border-slate-100", cfg.badge)}>
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="font-semibold text-sm">{status} Loans</span>
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold tabular-nums">
            {loans.length.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Loan Count",      value: loans.length.toLocaleString() },
            { label: "Total UPB",       value: `$${(totalUpb / 1_000_000).toFixed(2)}M` },
            { label: "Avg Balance",     value: `$${(avgBalance / 1_000).toFixed(0)}K` },
            { label: "Wtd Avg Coupon",  value: `${wac.toFixed(2)}%` },
            { label: "Top State",       value: topState },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-0.5 text-sm font-bold text-slate-800 tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        {/* Breakdown bars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "Product Mix", bars: productBars },
            { title: "Purpose",     bars: purposeBars },
            { title: "Top States",  bars: stateBars },
          ].map(({ title, bars }) => {
            const max = bars[0]?.[1] ?? 1;
            return (
              <div key={title}>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</div>
                <div className="space-y-1.5">
                  {bars.map(([name, count]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 truncate text-[11px] text-slate-600 font-medium">{name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", cfg.dot)}
                          style={{ width: `${(count / max) * 100}%`, opacity: 0.75 }}
                        />
                      </div>
                      <span className="w-8 text-right text-[10px] text-slate-400 tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loan table */}
        <div className="rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2">
            <span className="text-xs font-semibold text-slate-600">All {status} Loans</span>
            <span className="text-[11px] text-slate-400">Page {page + 1} of {totalPages} · {sorted.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-3 py-2 text-left font-semibold text-slate-500 w-8">#</th>
                  {([
                    ["id",          "Loan ID"],
                    ["product",     "Product"],
                    ["state",       "State"],
                    ["upb",         "UPB"],
                    ["coupon",      "Coupon"],
                    ["purpose",     "Purpose"],
                    ["occupancy",   "Occupancy"],
                    ["dti",         "DTI"],
                    ["units",       "Units"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="px-3 py-2 text-left font-semibold text-slate-500">
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors"
                      >
                        {label}
                        <SortIcon k={key} />
                      </button>
                    </th>
                  ))}
                  {showBuyer && <th className="px-3 py-2 text-left font-semibold text-slate-500">Buyer ID</th>}
                  <th className="px-3 py-2 text-center font-semibold text-slate-400 w-10">
                    <GitCompare className="h-3.5 w-3.5 mx-auto" strokeWidth={2} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((loan, i) => {
                  const inCompare = isInCompare(loan.id);
                  return (
                    <tr
                      key={loan.id}
                      className={cn("border-b border-slate-50 transition-colors hover:bg-slate-50/60", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}
                    >
                      <td className="px-3 py-2 text-slate-400 tabular-nums">{page * PAGE_SIZE + i + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{loan.id}</td>
                      <td className="px-3 py-2 text-slate-700">{loan.product}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700">{loan.state}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">${(loan.upb / 1_000).toFixed(0)}K</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{loan.coupon.toFixed(3)}%</td>
                      <td className="px-3 py-2 text-slate-600">{loan.purpose}</td>
                      <td className="px-3 py-2 text-slate-600">{loan.occupancy}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-600">{loan.dti.toFixed(0)}%</td>
                      <td className="px-3 py-2 tabular-nums text-slate-600">{loan.units}</td>
                      {showBuyer && <td className="px-3 py-2 font-mono text-sky-600">{loan.buyerId ?? "—"}</td>}
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          title={inCompare ? "Remove from compare" : "Add to compare (max 5)"}
                          onClick={() => inCompare ? removeFromCompare(loan.id) : addToCompare(loan)}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                            inCompare
                              ? "bg-sky-500 text-white hover:bg-red-500"
                              : "bg-slate-100 text-slate-400 hover:bg-sky-100 hover:text-sky-600"
                          )}
                        >
                          {inCompare ? <X className="h-3 w-3" strokeWidth={2.5} /> : <Plus className="h-3 w-3" strokeWidth={2.5} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3 + i, totalPages - 7 + i));
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-6 w-6 rounded-lg text-[11px] font-medium transition-colors",
                        p === page ? "bg-sky-500 text-white" : "text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {p + 1}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Step2SearchLoans() {
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sliderState, setSliderState] = useState<SliderState>(SLIDER_DEFAULTS);
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { importedLoans, setImportedLoans } = useLoanContext();

  const toggleStatus = useCallback((s: LoanStatus) => {
    setSelectedStatus(prev => prev === s ? null : s);
  }, []);

  const allLoans = useMemo(
    () => importedLoans ? importedLoans.map(loanRecordToStep2Loan) : step2Loans,
    [importedLoans],
  );

  const filteredLoans = useMemo(
    () => filterLoansByField(allLoans, filterState, sliderState),
    [allLoans, filterState, sliderState],
  );

  const drilldownLoans = useMemo(
    () => selectedStatus ? filteredLoans.filter(l => l.status === selectedStatus) : [],
    [filteredLoans, selectedStatus],
  );

  const handleFilterChange = useCallback((group: string, value: string, checked: boolean) => {
    setFilterState((prev) => {
      const arr = prev[group] ?? [];
      const next = checked ? [...arr, value] : arr.filter((x) => x !== value);
      if (next.length === 0) {
        const { [group]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [group]: next };
    });
  }, []);

  const handleSliderChange = useCallback((field: string, range: [number, number]) => {
    setSliderState((prev) => ({ ...prev, [field]: range }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterState({});
    setSliderState(SLIDER_DEFAULTS);
  }, []);

  const drilldown = useCallback((group: string, value: string) => {
    setFilterState((prev) => {
      const arr = prev[group] ?? [];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      if (next.length === 0) {
        const { [group]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [group]: next };
    });
  }, []);

  const interestRateBars = useMemo(
    () => aggregateByField(filteredLoans, "interestRate").sort((a, b) => {
      const order = ["2–2.5", "2.5–3", "3–3.5", "3.5–4", "4–4.5", "4.5–5", "5–5.5", "5.5–6"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    }),
    [filteredLoans],
  );

  const stateBars = useMemo(
    () => aggregateByField(filteredLoans, "state").sort((a, b) => b.value - a.value),
    [filteredLoans],
  );

  const productDonut = useMemo(
    () => aggregateDonut(filteredLoans, "product").map((d, i) => ({ ...d, color: DONUT_REFERENCE_COLORS[i % DONUT_REFERENCE_COLORS.length] })),
    [filteredLoans],
  );
  const purposeDonut = useMemo(
    () => aggregateDonut(filteredLoans, "purpose").map((d, i) => ({ ...d, color: DONUT_REFERENCE_COLORS[i % DONUT_REFERENCE_COLORS.length] })),
    [filteredLoans],
  );
  const loanTypeDonut = useMemo(
    () => aggregateDonut(filteredLoans, "loanType").map((d, i) => ({ ...d, color: DONUT_REFERENCE_COLORS[i % DONUT_REFERENCE_COLORS.length] })),
    [filteredLoans],
  );

  const kpis: KpiItem[] = useMemo(() => {
    const totalUpb = filteredLoans.reduce((s, l) => s + l.upb, 0);
    const totalLoans = filteredLoans.length;
    const wac = totalLoans > 0
      ? filteredLoans.reduce((s, l) => s + l.coupon * l.upb, 0) / filteredLoans.reduce((s, l) => s + l.upb, 0)
      : 0;
    const wad = totalLoans > 0
      ? filteredLoans.reduce((s, l) => s + l.duration * l.upb, 0) / filteredLoans.reduce((s, l) => s + l.upb, 0)
      : 0;
    const available = filteredLoans.filter(l => l.status === "Available").length;
    return [
      { label: "Total UPB", value: "$" + (totalUpb / 1_000_000).toFixed(1) + "M", icon: Banknote },
      { label: "Total Loans", value: totalLoans.toLocaleString(), icon: LayoutList },
      { label: "Available", value: available.toLocaleString(), icon: CheckCircle2 },
      { label: "Wtd Avg Coupon", value: wac.toFixed(2) + "%", icon: Percent },
      { label: "Bond Equiv Yield*", value: (wac * 0.9).toFixed(2) + "%", icon: TrendingUp },
      { label: "Wtd Avg Duration*", value: wad.toFixed(2) + " yrs", icon: Clock },
    ];
  }, [filteredLoans]);

  return (
    <SprinkleShell
      stepId="2"
      kpis={kpis}
      filters={FILTER_GROUPS}
      filterState={filterState}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearAll}
      sliders={SLIDER_GROUPS}
      sliderState={sliderState}
      onSliderChange={handleSliderChange}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div data-tour="status-bar" className="min-w-0 flex-1">
          <StatusSummaryBar
            loans={filteredLoans}
            selectedStatus={selectedStatus}
            onStatusClick={toggleStatus}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
              importedLoans
                ? "border-sky-300/80 bg-sky-50 text-sky-700 hover:bg-sky-100"
                : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" strokeWidth={2} />
            {importedLoans ? `${importedLoans.length.toLocaleString()} Loaded` : "Import"}
          </button>
          <ExportButton
            data={filteredLoans.map(step2LoanToLoanRecord)}
            filename="loans_search"
            exportCSV={(data: LoanRecord[]) => exportLoansToCSV(data)}
            exportExcel={(data: LoanRecord[]) => exportLoansToExcel(data)}
          />
        </div>
      </div>

      {selectedStatus && (
        <StatusDrilldownPanel
          status={selectedStatus}
          loans={drilldownLoans}
          onClose={() => setSelectedStatus(null)}
        />
      )}

      <div className="grid grid-cols-12 gap-4">
        <PanelCard className="col-span-12 lg:col-span-6" icon={Percent} title="Available Loans by Interest Rate">
          <div className="h-[250px]">
            <VerticalBarChart
              data={interestRateBars}
              valueBasedColors
              onBarClick={(name) => drilldown("Interest Rate", name)}
            />
          </div>
        </PanelCard>
        <PanelCard className="col-span-12 lg:col-span-6" icon={MapPinned} title="Available Loans by State-County">
          <div className="h-[250px] overflow-x-auto">
            <div className="min-w-[600px] h-full">
              <VerticalBarChart
                data={stateBars}
                valueBasedColors
                onBarClick={(name) => drilldown("State", name)}
              />
            </div>
          </div>
        </PanelCard>

        <PanelCard className="col-span-12 lg:col-span-4" icon={PieChart} title="Available Loans by Product Type">
          <div className="h-[260px]">
            <DonutChart data={productDonut} onSegmentClick={(name) => drilldown("Product Type", name)} />
          </div>
        </PanelCard>
        <PanelCard className="col-span-12 lg:col-span-4" icon={Target} title="Available Loans by Purpose">
          <div className="h-[260px]">
            <DonutChart data={purposeDonut} onSegmentClick={(name) => drilldown("Purpose", name)} />
          </div>
        </PanelCard>
        <PanelCard className="col-span-12 lg:col-span-4" icon={FileText} title="Available Loans by Loan Type">
          <div className="h-[260px]">
            <DonutChart data={loanTypeDonut} onSegmentClick={(name) => drilldown("Loan Type", name)} />
          </div>
        </PanelCard>

        <PanelCard className="col-span-12" icon={LayoutList} title="Portfolio Breakdown Details" subtitle="Click a row to filter">
          <BreakdownDetails
            filteredLoans={filteredLoans}
            productDonut={productDonut}
            purposeDonut={purposeDonut}
            loanTypeDonut={loanTypeDonut}
            interestRateBars={interestRateBars}
            stateBars={stateBars}
            onDrilldown={drilldown}
          />
        </PanelCard>

        {/* Status breakdown card */}
        <PanelCard className="col-span-12" icon={Scale} title="Loan Status Breakdown" subtitle="Click any card to view all loans for that status">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["Available", "Allocated", "Committed", "Sold"] as LoanStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = filteredLoans.filter(l => l.status === s).length;
              const upb = filteredLoans.filter(l => l.status === s).reduce((sum, l) => sum + l.upb, 0);
              const pct = filteredLoans.length > 0 ? (count / filteredLoans.length) * 100 : 0;
              const Icon = cfg.icon;
              const isSelected = selectedStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all duration-150 hover:scale-[1.02]",
                    cfg.badge,
                    isSelected ? "ring-2 ring-offset-1 ring-current shadow-md scale-[1.01]" : ""
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      <span className="font-semibold text-sm">{s}</span>
                    </div>
                    {isSelected && <span className="text-[10px] font-bold opacity-60">▼ open</span>}
                  </div>
                  <div className="text-xl font-bold tabular-nums">{count.toLocaleString()}</div>
                  <div className="text-[11px] opacity-70 mt-0.5">${(upb / 1_000_000).toFixed(1)}M UPB · {pct.toFixed(0)}%</div>
                  <div className="mt-2 h-1 rounded-full bg-current/20">
                    <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </PanelCard>
      </div>

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500 [font-family:var(--font-sans)]">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImport={(loans) => { setImportedLoans(loans); setUploadOpen(false); }}
      />

      <TourBubble
        stepKey="step2"
        delay={1200}
        steps={[
          {
            title: "Step 2 — Loan Search & Filters",
            body: "This panel holds all your filters: product type, state, occupancy, purpose, and more. Range sliders at the bottom let you set exact LTV and FICO windows. Active filters appear as chips you can remove one at a time.",
            icon: "list",
            target: "filter-rail",
          },
          {
            title: "Status Summary Bar",
            body: "These coloured pills show counts and UPB for each status. Click any pill to open a detailed drilldown panel with KPIs, breakdowns, and a full sortable loan table.",
            icon: "chart",
            target: "status-bar",
          },
          {
            title: "Compare Loans Side-by-Side",
            body: "In the drilldown table, tap the + on any row to queue that loan for comparison (up to 5). The Compare tray slides up from the bottom — click Compare to see a side-by-side table with green/red best-vs-worst highlighting.",
            icon: "lightbulb",
            target: "status-bar",
            cta: "Got it",
          },
        ]}
        position="bottom-right"
      />
    </SprinkleShell>
  );
}
