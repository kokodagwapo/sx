import { useCallback, useMemo, useState } from "react";
import { Percent, MapPinned, PieChart, Target, FileText, Banknote, LayoutList, Clock, Scale, TrendingUp, CheckCircle2, Lock, AlertCircle, Tag } from "lucide-react";
import { ExportButton } from "@/components/importExport/ExportButton";
import { exportLoansToCSV } from "@/data/csv/csvExporter";
import { exportLoansToExcel } from "@/data/excel/excelExporter";
import { step2LoanToLoanRecord } from "@/data/converters";
import type { LoanRecord } from "@/data/types/loanRecord";
import type { LoanStatus } from "@/data/types/loanRecord";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import type { KpiItem } from "@/components/step/KpiStrip";
import type { FilterState } from "@/components/filters/FilterRail";
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
  { section: "Product", title: "Interest Rate", options: ["2–2.5", "2.5–3", "3–3.5", "3.5–4", "4–4.5", "4.5–5", "5–5.5", "5.5–6"] },
  { section: "Product", title: "Occupancy", options: ["Owner", "Investment", "Second home"] },
  { section: "Product", title: "Purpose", options: ["Purchase", "Refinance"] },
  { section: "Product", title: "Property Type", options: ["Single-family", "Condo", "Townhouse"] },
  { section: "Product", title: "Loan Type", options: ["Conventional", "Government", "Jumbo"] },
  { section: "Product", title: "Status", options: ["Available", "Allocated", "Committed", "Sold"] },
  { section: "Credit", title: "LTV", options: ["<60", "60–70", "70–80", "80–90", ">90"] },
  { section: "Credit", title: "FICO", options: ["<680", "680–720", "720–760", ">760"] },
  { section: "Credit", title: "DTI", options: ["<36", "36–43", ">43"] },
  { section: "Credit", title: "Loan Amount", options: ["<250k", "250k–500k", "500k–750k", ">750k"] },
  { section: "Product", title: "State", options: ["CA", "FL", "GA", "NY", "PA", "TX", "VA", "WA", "AZ", "NJ", "CO", "IL", "OH", "NC", "MI", "DE", "SC", "MD", "TN", "MA", "IN", "UT", "OR"] },
];

function filterLoansByField(loans: Step2Loan[], state: FilterState): Step2Loan[] {
  const fieldMap: Record<string, keyof Step2Loan> = {
    "Product Type": "product",
    "Interest Rate": "interestRate",
    State: "state",
    Occupancy: "occupancy",
    Purpose: "purpose",
    "Property Type": "propertyType",
    "Loan Type": "loanType",
    Status: "status",
  };
  return loans.filter((loan) => {
    for (const [group, selected] of Object.entries(state)) {
      if (!selected?.length) continue;
      const key = fieldMap[group];
      if (!key) continue;
      const value = loan[key];
      if (typeof value !== "string" || !selected.includes(value)) return false;
    }
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

function StatusSummaryBar({ loans }: { loans: Step2Loan[] }) {
  const total = loans.length;
  const byStatus = useMemo(() => {
    const counts = { Available: 0, Allocated: 0, Committed: 0, Sold: 0 };
    for (const l of loans) counts[l.status] = (counts[l.status] ?? 0) + 1;
    return counts;
  }, [loans]);

  return (
    <div className="flex flex-wrap gap-3">
      {(["Available", "Allocated", "Committed", "Sold"] as LoanStatus[]).map((s) => {
        const cfg = STATUS_CONFIG[s];
        const count = byStatus[s] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const Icon = cfg.icon;
        return (
          <div key={s} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", cfg.badge)}>
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="font-semibold">{count.toLocaleString()}</span>
            <span className="font-medium opacity-80">{s}</span>
            <span className="text-xs opacity-60">({pct.toFixed(0)}%)</span>
          </div>
        );
      })}
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

export default function Step2SearchLoans() {
  const [filterState, setFilterState] = useState<FilterState>({});

  const filteredLoans = useMemo(
    () => filterLoansByField(step2Loans, filterState),
    [filterState],
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
      onClearFilters={() => setFilterState({})}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <StatusSummaryBar loans={filteredLoans} />
        </div>
        <ExportButton
          data={filteredLoans.map(step2LoanToLoanRecord)}
          filename="loans_search"
          exportCSV={(data: LoanRecord[]) => exportLoansToCSV(data)}
          exportExcel={(data: LoanRecord[]) => exportLoansToExcel(data)}
        />
      </div>

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
        <PanelCard className="col-span-12" icon={Scale} title="Loan Status Breakdown" subtitle="Transaction lifecycle tracking">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["Available", "Allocated", "Committed", "Sold"] as LoanStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = filteredLoans.filter(l => l.status === s).length;
              const upb = filteredLoans.filter(l => l.status === s).reduce((sum, l) => sum + l.upb, 0);
              const pct = filteredLoans.length > 0 ? (count / filteredLoans.length) * 100 : 0;
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => drilldown("Status", s)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all duration-150 hover:scale-[1.02]",
                    cfg.badge,
                    (filterState["Status"] ?? []).includes(s) ? "ring-2 ring-offset-1 ring-current" : ""
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span className="font-semibold text-sm">{s}</span>
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
    </SprinkleShell>
  );
}
