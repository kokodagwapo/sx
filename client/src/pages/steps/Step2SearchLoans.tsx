import { useCallback, useMemo, useState } from "react";
import { Percent, MapPinned, PieChart, Target, FileText, Banknote, LayoutList, Clock, Scale, TrendingUp } from "lucide-react";
import { ExportButton } from "@/components/importExport/ExportButton";
import { exportLoansToCSV } from "@/data/csv/csvExporter";
import { exportLoansToExcel } from "@/data/excel/excelExporter";
import { step2LoanToLoanRecord } from "@/data/converters";
import type { LoanRecord } from "@/data/types/loanRecord";
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

const FILTER_GROUPS = [
  { section: "Product", title: "Product Type", options: ["30 FRM", "15 FRM", "7/1 ARM", "5/1 ARM"] },
  { section: "Product", title: "Interest Rate", options: ["2–2.5", "2.5–3", "3–3.5", "3.5–4", "4–4.5", "4.5–5", "5–5.5", "5.5–6"] },
  { section: "Product", title: "Occupancy", options: ["Owner", "Investment", "Second home"] },
  { section: "Product", title: "Purpose", options: ["Purchase", "Refinance"] },
  { section: "Product", title: "Property Type", options: ["Single-family", "Condo", "Townhouse"] },
  { section: "Product", title: "Loan Type", options: ["Conventional", "Government", "Jumbo"] },
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
  };
  return loans.filter((loan) => {
    for (const [group, selected] of Object.entries(state)) {
      if (!selected?.length) continue;
      const key = fieldMap[group];
      if (!key) continue; // skip Credit filters (no data yet)
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
  "#22c55e", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#f97316",
];

function BreakdownColumn({
  title,
  data,
  total,
  filterGroup,
  onDrilldown,
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
  filteredLoans,
  productDonut,
  purposeDonut,
  loanTypeDonut,
  interestRateBars,
  stateBars,
  onDrilldown,
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
  const rateDonuts: DonutDatum[] = interestRateBars.map((b, i) => ({
    name: b.name,
    value: b.value,
    color: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length],
  }));
  const stateDonuts: DonutDatum[] = stateBars.slice(0, 8).map((b, i) => ({
    name: b.name,
    value: b.value,
    color: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length],
  }));

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
    return [
      { label: "Total Unpaid Principal Balance (UPB)", value: totalUpb.toLocaleString("en-US", { maximumFractionDigits: 0 }), icon: Banknote },
      { label: "Total Loans Meeting Criteria", value: totalLoans.toLocaleString(), icon: LayoutList },
      { label: "Weighted Average Coupon", value: wac.toFixed(2), icon: Percent },
      { label: "Bond Equivalent Yield*", value: (wac * 0.9).toFixed(2), icon: TrendingUp },
      { label: "Weighted Average Duration*", value: wad.toFixed(2), icon: Clock },
      { label: "Weighted Price Indication**", value: (100 + wac * 0.75).toFixed(2), icon: Scale },
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
      <div className="mb-4 flex justify-end">
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
            <DonutChart
              data={productDonut}
              onSegmentClick={(name) => drilldown("Product Type", name)}
            />
          </div>
        </PanelCard>
        <PanelCard className="col-span-12 lg:col-span-4" icon={Target} title="Available Loans by Purpose">
          <div className="h-[260px]">
            <DonutChart
              data={purposeDonut}
              onSegmentClick={(name) => drilldown("Purpose", name)}
            />
          </div>
        </PanelCard>
        <PanelCard className="col-span-12 lg:col-span-4" icon={FileText} title="Available Loans by Loan Type">
          <div className="h-[260px]">
            <DonutChart
              data={loanTypeDonut}
              onSegmentClick={(name) => drilldown("Loan Type", name)}
            />
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
      </div>

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500 [font-family:var(--font-sans)]">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
