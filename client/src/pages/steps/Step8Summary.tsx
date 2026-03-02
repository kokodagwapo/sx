import { useState } from "react";
import {
  PieChart,
  Home,
  Target,
  MapPinned,
  LayoutDashboard,
  ScatterChart,
  Table2,
  Clock,
  LayoutList,
  Banknote,
  Scale,
  Sparkles,
  TrendingUp,
  X,
  Percent,
  FileText,
} from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { DonutChart } from "@/components/charts/DonutChart";
import { WacByProductChart } from "@/components/charts/WacByProductChart";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import {
  step8LoanTerms,
  step8Occupancy,
  step8ProductType,
  step8Purpose,
  step8States,
  step8WacByProduct,
  step8CompositionDrilldown,
  step8CreditDrilldown,
  step8WacDrilldown,
  step8KpiDrilldown,
  type LoanTermRow,
  type CompositionDrilldown,
  type CreditMetricDrilldown,
  type WacProductDrilldown,
} from "@/data/mock/step8";
import type { KpiItem } from "@/components/step/KpiStrip";
import { cn } from "@/lib/utils";

const STEP8_KPIS: KpiItem[] = [
  { id: "upb", label: "Total Unpaid Principal Balance (UPB)", value: "1,534,248,974", icon: Banknote },
  { id: "loans", label: "Total Loans Meeting Criteria", value: "6,293", icon: FileText },
  { id: "coupon", label: "Weighted Average Coupon*", value: "4.13", icon: Percent },
  { id: "bey", label: "Bond Equivalent Yield*", value: "3.73", icon: Target },
  { id: "duration", label: "Weighted Average Duration*", value: "7.51", icon: Clock },
  { id: "price", label: "Weighted Price Indication**", value: "103.05", icon: Scale },
];

type DrilldownType = "composition" | "credit" | "wac" | "term" | "kpi" | null;

function DrilldownPanel({
  title,
  data,
  onClose,
  type,
}: {
  title: string;
  data:
    | CompositionDrilldown
    | CreditMetricDrilldown
    | WacProductDrilldown
    | { term: string; loans: number; totalAmount: number; wpi: number };
  onClose: () => void;
  type: "composition" | "credit" | "term" | "wac";
}) {
  if (type === "composition") {
    const c = data as CompositionDrilldown;
    return (
      <PanelCard
        className="border-indigo-200/60 bg-indigo-50/40 opacity-0 animate-fade-in-up"
        icon={Sparkles}
        title={title}
        right={
          <button type="button" onClick={onClose} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
            <X className="h-3.5 w-3.5" /> Close
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/90 px-3 py-2.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Definition</div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{c.definition}</p>
          </div>
          <div className="text-sm font-bold text-indigo-600 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            {c.pct.toFixed(1)}% of portfolio
          </div>
          <ul className="space-y-2">
            {c.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 bg-white/50 p-2 rounded-lg border border-indigo-100/50">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </PanelCard>
    );
  }

  if (type === "credit") {
    const c = data as CreditMetricDrilldown;
    return (
      <PanelCard
        className="border-blue-200/60 bg-blue-50/40 opacity-0 animate-fade-in-up"
        icon={Sparkles}
        title={title}
        right={
          <button type="button" onClick={onClose} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
            <X className="h-3.5 w-3.5" /> Close
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/90 px-3 py-2.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Definition</div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{c.definition}</p>
          </div>
          <div className="text-2xl font-black text-blue-600 tabular-nums drop-shadow-sm">{c.value}</div>
          <ul className="space-y-2">
            {c.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 bg-white/50 p-2 rounded-lg border border-blue-100/50">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </PanelCard>
    );
  }

  if (type === "wac") {
    const w = data as WacProductDrilldown;
    return (
      <PanelCard
        className="border-blue-200/60 bg-blue-50/40 opacity-0 animate-fade-in-up"
        icon={ScatterChart}
        title={title}
        right={
          <button type="button" onClick={onClose} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
            <X className="h-3.5 w-3.5" /> Close
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/90 px-3 py-2.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Definition</div>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{w.definition}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-100 bg-white/90 px-3 py-2.5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400"># of Loans</div>
              <div className="mt-1 text-lg font-black text-blue-600">{w.loans.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-rose-100 bg-white/90 px-3 py-2.5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">WAC</div>
              <div className="mt-1 text-lg font-black text-rose-600 tabular-nums">{w.wac.toFixed(2)}</div>
            </div>
          </div>
          <ul className="space-y-2">
            {w.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 bg-white/50 p-2 rounded-lg border border-blue-100/50">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </PanelCard>
    );
  }

  const t = data as { term: string; loans: number; totalAmount: number; wpi: number };
  return (
    <PanelCard
      className="border-sky-200/60 bg-sky-50/30 opacity-0 animate-fade-in-up"
      icon={Table2}
      title={title}
      subtitle={`Original Loan Term: ${t.term}`}
      right={
        <button type="button" onClick={onClose} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
          <X className="h-3.5 w-3.5" /> Close
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500"># of Loans</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-slate-800">{t.loans.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Loan Amount</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-slate-800">
            {t.totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Weighted Price Indication</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-slate-800">{t.wpi.toFixed(2)}</div>
        </div>
      </div>
    </PanelCard>
  );
}

function Small({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
      <div role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-xl border border-blue-100 bg-white px-4 py-3 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm",
        onClick && "cursor-pointer"
      )}
    >
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-blue-600 tabular-nums [font-family:var(--font-display)]">
        {value}
      </div>
    </div>
  );
}

const columns = [
  sortableColumn<LoanTermRow>("term", "Original Loan Term", { icon: Clock }),
  sortableColumn<LoanTermRow>("loans", "# of Loans", {
    icon: LayoutList,
    cell: ({ getValue }) => Intl.NumberFormat("en-US").format(getValue() as number),
    sortingFn: "numeric",
  }),
  sortableColumn<LoanTermRow>("totalAmount", "Total Loan Amount", {
    icon: Banknote,
    cell: ({ getValue }) => Intl.NumberFormat("en-US").format(getValue() as number),
    sortingFn: "numeric",
  }),
  sortableColumn<LoanTermRow>("wpi", "Weighted Price Indication", {
    icon: Scale,
    cell: ({ getValue }) => (getValue() as number).toFixed(2),
    sortingFn: "numeric",
  }),
];

const CREDIT_ITEMS: { key: string; label: string; value: string }[] = [
  { key: "avgLoanSize", label: "Average Loan Size", value: "243,802" },
  { key: "wavgLtv", label: "Weighted Avg LTV", value: "80.33%" },
  { key: "wavgFico", label: "Weighted Avg FICO", value: "720" },
  { key: "wavgDti", label: "Weighted Avg DTI", value: "37.74%" },
  { key: "wavgMaturity", label: "Weighted Avg Maturity", value: "28" },
];

export default function Step8Summary() {
  const [drilldown, setDrilldown] = useState<{
    type: DrilldownType;
    chartKey?: string;
    segment?: string;
    creditKey?: string;
    termRow?: LoanTermRow;
    wacProduct?: string;
    kpiId?: string;
  } | null>(null);

  const handleKpiClick = (item: KpiItem) => {
    const id = item.id ?? null;
    if (!id || !step8KpiDrilldown[id]) return;
    setDrilldown((prev) =>
      prev?.type === "kpi" && prev.kpiId === id ? null : { type: "kpi", kpiId: id }
    );
  };

  const handleCompositionClick = (chartKey: string, segment: string) => {
    const data = step8CompositionDrilldown[chartKey]?.[segment];
    if (data) {
      setDrilldown((prev) =>
        prev?.type === "composition" && prev.chartKey === chartKey && prev.segment === segment
          ? null
          : { type: "composition", chartKey, segment }
      );
    }
  };

  const handleCreditClick = (key: string) => {
    setDrilldown((prev) =>
      prev?.type === "credit" && prev.creditKey === key ? null : { type: "credit", creditKey: key }
    );
  };

  const handleTermRowClick = (row: LoanTermRow) => {
    setDrilldown((prev) =>
      prev?.type === "term" && prev.termRow?.term === row.term ? null : { type: "term", termRow: row }
    );
  };

  const handleWacClick = (name: string) => {
    setDrilldown((prev) =>
      prev?.type === "wac" && prev.wacProduct === name ? null : { type: "wac", wacProduct: name }
    );
  };

  const closeDrilldown = () => setDrilldown(null);

  const wacData =
    drilldown?.type === "wac" && drilldown.wacProduct
      ? step8WacDrilldown[drilldown.wacProduct]
      : null;
  const compositionData =
    drilldown?.type === "composition" && drilldown.chartKey && drilldown.segment
      ? step8CompositionDrilldown[drilldown.chartKey]?.[drilldown.segment]
      : null;
  const creditData =
    drilldown?.type === "credit" && drilldown.creditKey
      ? step8CreditDrilldown[drilldown.creditKey]
      : null;
  const termData = drilldown?.type === "term" ? drilldown.termRow : null;

  const kpiData = drilldown?.type === "kpi" && drilldown.kpiId ? step8KpiDrilldown[drilldown.kpiId] : null;

  return (
    <SprinkleShell stepId="8" kpis={STEP8_KPIS} animateKpis onKpiClick={(item) => item.id && handleKpiClick(item)}>
      <div className="grid grid-cols-12 gap-4">
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1 lg:col-span-3"
          icon={PieChart}
          title="Product Type Composition"
          subtitle="TOTAL 100% • Click segment for drilldown"
        >
          <div className="h-[240px]">
            <DonutChart
              data={step8ProductType}
              onSegmentClick={(name) => handleCompositionClick("productType", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-2 lg:col-span-3"
          icon={Home}
          title="Occupancy Composition"
          subtitle="TOTAL 100% • Click segment for drilldown"
        >
          <div className="h-[240px]">
            <DonutChart
              data={step8Occupancy}
              onSegmentClick={(name) => handleCompositionClick("occupancy", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-3 lg:col-span-3"
          icon={Target}
          title="Purpose Composition"
          subtitle="TOTAL 100% • Click segment for drilldown"
        >
          <div className="h-[240px]">
            <DonutChart
              data={step8Purpose}
              onSegmentClick={(name) => handleCompositionClick("purpose", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-4 lg:col-span-3"
          icon={MapPinned}
          title="Selected Loans by State"
          subtitle="TOTAL 100% • Click segment for drilldown"
        >
          <div className="h-[240px]">
            <DonutChart
              data={step8States}
              onSegmentClick={(name) => handleCompositionClick("states", name)}
            />
          </div>
        </PanelCard>

        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-5 lg:col-span-3"
          icon={LayoutDashboard}
          title="Credit Summary"
          subtitle="Click metric for drilldown"
        >
          <div className="space-y-3">
            {CREDIT_ITEMS.map((item) => (
              <Small
                key={item.key}
                label={item.label}
                value={item.value}
                onClick={() => handleCreditClick(item.key)}
              />
            ))}
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-5 lg:col-span-5"
          icon={ScatterChart}
          title="What is the WAC for each Product Type?"
          subtitle="# of Loans (blue) • Weighted Avg Coupon (red) • Click for drilldown"
        >
          <div className="h-[260px]">
            <WacByProductChart
              data={step8WacByProduct}
              onBarClick={handleWacClick}
              onPointClick={handleWacClick}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-12 opacity-0 animate-fade-in-up animate-fade-in-up-delay-6 lg:col-span-4"
          icon={Table2}
          title="Loan Term"
          subtitle="Click row for drilldown"
        >
          <DataTable
            data={step8LoanTerms}
            columns={columns}
            height={260}
            animateRows
            stripeRows
            onRowClick={handleTermRowClick}
          />
        </PanelCard>
      </div>

      {kpiData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${kpiData.label}`}
            data={kpiData}
            onClose={closeDrilldown}
            type="credit"
          />
        </div>
      )}
      {wacData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`WAC Drilldown: ${wacData.name}`}
            data={wacData}
            onClose={closeDrilldown}
            type="wac"
          />
        </div>
      )}
      {compositionData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${compositionData.segment}`}
            data={compositionData}
            onClose={closeDrilldown}
            type="composition"
          />
        </div>
      )}
      {creditData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${creditData.label}`}
            data={creditData}
            onClose={closeDrilldown}
            type="credit"
          />
        </div>
      )}
      {termData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Loan Term: ${termData.term}`}
            data={termData}
            onClose={closeDrilldown}
            type="term"
          />
        </div>
      )}

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC, 2016–2017. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
