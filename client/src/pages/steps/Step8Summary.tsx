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
  ShieldCheck,
  Building2,
  Users,
  Landmark,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  DollarSign,
} from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { TourBubble } from "@/components/onboarding/TourBubble";
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
  { id: "upb", label: "Total Unpaid Principal Balance (UPB)", value: "1,861,333,635", icon: Banknote },
  { id: "loans", label: "Total Loans Meeting Criteria", value: "7,050", icon: FileText },
  { id: "coupon", label: "Weighted Average Coupon*", value: "3.50", icon: Percent },
  { id: "bey", label: "Bond Equivalent Yield*", value: "3.17", icon: Target },
  { id: "duration", label: "Weighted Average Duration*", value: "6.80", icon: Clock },
  { id: "price", label: "Weighted Price Indication**", value: "100.71", icon: Scale },
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
        "rounded-xl border border-blue-100 bg-white px-3 sm:px-4 py-2.5 sm:py-3 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm",
        onClick && "cursor-pointer"
      )}
    >
      <div className="text-[11px] sm:text-xs font-medium text-slate-500 break-words">{label}</div>
      <div className="mt-0.5 sm:mt-1 text-base sm:text-xl font-semibold tracking-tight text-blue-600 tabular-nums [font-family:var(--font-display)]">
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
      <div data-tour="summary-header" className="grid grid-cols-12 gap-3 sm:gap-4">
        <PanelCard
          className="col-span-6 sm:col-span-6 lg:col-span-3 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
          icon={PieChart}
          title="Product Type"
          subtitle="Click segment"
        >
          <div className="h-[180px] sm:h-[240px]">
            <DonutChart
              data={step8ProductType}
              onSegmentClick={(name) => handleCompositionClick("productType", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-6 sm:col-span-6 lg:col-span-3 opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
          icon={Home}
          title="Occupancy"
          subtitle="Click segment"
        >
          <div className="h-[180px] sm:h-[240px]">
            <DonutChart
              data={step8Occupancy}
              onSegmentClick={(name) => handleCompositionClick("occupancy", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-6 sm:col-span-6 lg:col-span-3 opacity-0 animate-fade-in-up animate-fade-in-up-delay-3"
          icon={Target}
          title="Purpose"
          subtitle="Click segment"
        >
          <div className="h-[180px] sm:h-[240px]">
            <DonutChart
              data={step8Purpose}
              onSegmentClick={(name) => handleCompositionClick("purpose", name)}
            />
          </div>
        </PanelCard>
        <PanelCard
          className="col-span-6 sm:col-span-6 lg:col-span-3 opacity-0 animate-fade-in-up animate-fade-in-up-delay-4"
          icon={MapPinned}
          title="By State"
          subtitle="Click segment"
        >
          <div className="h-[180px] sm:h-[240px]">
            <DonutChart
              data={step8States}
              onSegmentClick={(name) => handleCompositionClick("states", name)}
            />
          </div>
        </PanelCard>

        <PanelCard
          className="col-span-12 sm:col-span-6 lg:col-span-3 opacity-0 animate-fade-in-up animate-fade-in-up-delay-5"
          icon={LayoutDashboard}
          title="Credit Summary"
          subtitle="Click metric for drilldown"
        >
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
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
          className="col-span-12 sm:col-span-6 lg:col-span-5 opacity-0 animate-fade-in-up animate-fade-in-up-delay-5"
          icon={ScatterChart}
          title="WAC by Product Type"
          subtitle="Loans (blue) • WAC (red) • Click for drilldown"
        >
          <div className="h-[220px] sm:h-[260px]">
            <WacByProductChart
              data={step8WacByProduct}
              onBarClick={handleWacClick}
              onPointClick={handleWacClick}
            />
          </div>
        </PanelCard>
        <PanelCard
          data-tour="summary-table"
          className="col-span-12 lg:col-span-4 opacity-0 animate-fade-in-up animate-fade-in-up-delay-6"
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

      {/* ── Executive Intelligence Panel ───────────────────────── */}
      <footer data-tour="summary-footer" className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">

        {/* Deal Thesis */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-indigo-50/40 p-3.5 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600" strokeWidth={2} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Investment Thesis</span>
            <span className="ml-auto rounded-full bg-sky-100 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-sky-700 shrink-0">Brief</span>
          </div>
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                title: "Prime Credit Quality",
                body: "WA FICO 720+ with WA LTV 80.33% positions this pool in the top quartile of non-agency residential loan pools transacted since 2022. Lifetime expected credit losses at prime CPRs are modeled at 35–60 bps — well within institutional credit committee tolerances.",
              },
              {
                icon: DollarSign,
                color: "text-sky-600",
                bg: "bg-sky-50",
                title: "Below-Market Coupon Premium",
                body: "WA coupon of 3.50% in a 6.5%+ current rate environment creates negative prepayment incentive — borrowers cannot refinance to a better rate. CPR is expected at 4–7% annualized. This extension characteristic is a structural advantage for duration-matching buyers.",
              },
              {
                icon: ShieldCheck,
                color: "text-violet-600",
                bg: "bg-violet-50",
                title: "Diversified Geographic Spread",
                body: "Pool spans 35+ states, limiting single-market concentration risk. California exposure (~20% of UPB) is mitigated by strong WA LTV of 71% in that state. OCC Guidance OCC 2006-47 recommends no single state exceed 25% of residential book — this pool complies.",
              },
              {
                icon: ArrowUpRight,
                color: "text-amber-600",
                bg: "bg-amber-50",
                title: "Near-Par Execution",
                body: "At Teraverde's indicative WPI of 100.71, the pool trades at a 71 bps premium to UPB — reflecting coupon premium relative to current origination costs. Buyers acquiring at par or below capture immediate book value accretion under GAAP fair value measurement.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/80 bg-white/70 p-3 sm:p-3.5 backdrop-blur-sm">
                <div className={`mb-1.5 sm:mb-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md ${item.bg}`}>
                  <item.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${item.color}`} strokeWidth={2.5} />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5 sm:mb-1">{item.title}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed break-words">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buyer-Type Match Guide */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" strokeWidth={2} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Buyer Match Guide</span>
            <span className="ml-auto text-[9px] sm:text-[10px] text-slate-400 hidden sm:inline">Based on portfolio vs. buyer mandates</span>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Landmark,
                label: "Insurance Companies",
                match: 97,
                color: "emerald",
                rationale: "6.80-yr duration aligns with medium-term annuity reserve liabilities. NAIC RBC classification expected at CM-1/CM-2, favorable statutory capital treatment. Fixed cash flows provide ALM certainty. Low prepayment speed (CPR 4–7%) eliminates reinvestment risk. Preferred by CFOs targeting duration-matched spread over A-rated corporate bonds.",
                tags: ["Duration match", "NAIC CM-1", "ALM-fit", "Low CPR"],
              },
              {
                icon: Building2,
                label: "Community Banks (<$10B)",
                match: 91,
                color: "sky",
                rationale: "CRA credit via 35-state geographic footprint benefits institutions with multi-market assessment areas. Basel III standardized approach: conforming residential loans carry 50% risk weight, reducing Tier 1 capital consumption vs. commercial lending. Below-market coupon improves NIM relative to cost of deposits. ALCO favorable given asset sensitivity profile.",
                tags: ["CRA credit", "50% RWA", "NIM accretion", "Basel III"],
              },
              {
                icon: Users,
                label: "Credit Unions",
                match: 84,
                color: "violet",
                rationale: "NCUA Part 703 investment eligibility confirmed for first-lien residential mortgages with FICO 700+. WA LTV 80.33% within CUNA lending guidelines. Yield premium vs. agency MBS and government securities improves dividend sustainability. Acquisition at par maintains GAAP book value without immediate CECL reserve impact.",
                tags: ["NCUA 703", "Prime FICO", "Yield premium", "CECL-neutral"],
              },
              {
                icon: ShieldCheck,
                label: "Pension / Life Funds",
                match: 78,
                color: "amber",
                rationale: "Long-duration residential mortgages provide equity-uncorrelated income, reducing portfolio beta. Whole-loan ownership avoids TBA market inefficiencies. WA coupon of 3.50% generates $65M+ annual gross interest income on the pool — a predictable income stream that offsets defined-benefit liability growth assumptions of 3–4% annually.",
                tags: ["Uncorrelated", "Predictable income", "HTM accounting", "DB match"],
              },
            ].map((buyer) => {
              const bar = `bg-${buyer.color}-500`;
              const badge = `bg-${buyer.color}-50 text-${buyer.color}-700 border-${buyer.color}-200`;
              return (
                <div key={buyer.label} className="rounded-xl border border-slate-100 p-3 sm:p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                    <buyer.icon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div className="text-right">
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</div>
                      <div className={`text-base sm:text-lg font-black tabular-nums text-${buyer.color}-600`}>{buyer.match}%</div>
                    </div>
                  </div>
                  <div className="mb-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${buyer.match}%` }} />
                  </div>
                  <p className="text-[11px] sm:text-[12px] font-bold text-slate-700 mt-1.5 sm:mt-2 mb-1">{buyer.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed mb-2 break-words">{buyer.rationale}</p>
                  <div className="flex flex-wrap gap-1">
                    {buyer.tags.map((t) => (
                      <span key={t} className={`rounded-md border px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide ${badge}`}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Factors + Capital Treatment side-by-side */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Key Risk Factors */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 sm:p-5">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={2} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">Material Risk Factors</span>
              <span className="ml-auto text-[9px] sm:text-[10px] text-slate-400 italic hidden sm:inline">For credit committee disclosure</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Interest Rate / Duration Risk",
                  severity: "Medium",
                  sev_color: "text-amber-700 bg-amber-100",
                  body: "At 6.80 years WA duration, a 100 bps parallel rate shock reduces fair value by approximately 6.5–7.0% ($121–130M on $1.86B). Mitigant: below-market coupon creates deep negative convexity — prepayment optionality is essentially zero, making duration stable. ALCO stress tests at ±300 bps should be modeled before acquisition.",
                },
                {
                  title: "Geographic Concentration — California",
                  severity: "Low–Medium",
                  sev_color: "text-sky-700 bg-sky-100",
                  body: "California represents ~20% of pool UPB. CA is a non-recourse state (purchase money loans) and has robust anti-deficiency protections (CCP §580b). However, WA LTV in CA is approximately 71% — providing significant loss cushion even in a 20% HPA decline scenario. No single MSA exceeds 8% of portfolio.",
                },
                {
                  title: "Servicer Transition Risk",
                  severity: "Low",
                  sev_color: "text-emerald-700 bg-emerald-100",
                  body: "Loans are currently serviced by the originating sellers (Provident, Stonegate, New Penn). Whole loan transfer requires RESPA-compliant servicing transfer. Buyer should engage an approved MSP-licensed servicer or subservicer (e.g., Cenlar, LoanCare, PHH) 60–90 days pre-close. Transfer costs typically run $50–$75 per loan.",
                },
              ].map((risk) => (
                <div key={risk.title} className="rounded-xl border border-white/80 bg-white/70 p-3 sm:p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1 sm:mb-1.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-700 min-w-0">{risk.title}</p>
                    <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide shrink-0 ${risk.sev_color}`}>{risk.severity}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed break-words">{risk.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capital Treatment + Exit Liquidity */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 shrink-0" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Capital Treatment</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Basel III Risk Weight (Bank)", value: "50%", note: "Qualifying residential mortgages — standardized approach. Reduces Tier 1 capital consumption vs. CRE or C&I lending at 100%.", badge: "bg-sky-50 text-sky-700" },
                  { label: "CECL Lifetime Loss Estimate", value: "35–60 bps", note: "Based on prime 30FRM historical charge-off data (2000–2023, ex-GFC peak). Full CECL provision on $1.86B pool: ~$7–11M. Immaterial relative to pool size.", badge: "bg-emerald-50 text-emerald-700" },
                  { label: "NAIC RBC Classification", value: "CM-1 / CM-2", note: "Expected RBC designation for insurance company buyers under NAIC SSAP No. 43R. Favorable capital charge vs. equity or CMBS subordinates.", badge: "bg-violet-50 text-violet-700" },
                  { label: "NCUA Investment Authority", value: "Part 703 Eligible", note: "First-lien residential whole loans with prime FICO qualify under NCUA § 703.14. Credit union board approval required per Investment Policy Statement.", badge: "bg-amber-50 text-amber-700" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 rounded-lg border border-slate-100 p-2 sm:p-2.5">
                    <div className="shrink-0">
                      <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mb-0.5">{item.label}</div>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${item.badge}`}>{item.value}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed break-words">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5">
              <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 shrink-0" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Exit Liquidity Options</span>
              </div>
              <div className="space-y-2">
                {[
                  { strategy: "Whole-Loan Resale", timeline: "60–90 days", note: "Re-auction via MWAM, Auction.com, or bilateral broker-dealer. Strong secondary market for prime residential." },
                  { strategy: "Private-Label RMBS", timeline: "90–180 days", note: "Sufficient pool size ($1.86B) for standalone securitization. Tranching creates AAA/AA bonds at tighter spreads." },
                  { strategy: "GSE Delivery (Conforming Subset)", timeline: "30–45 days", note: "Conforming-balance loans (<$766,550) eligible for Fannie Mae or Freddie Mac MBS delivery at TBA pricing." },
                  { strategy: "Hold-to-Maturity (HTM)", timeline: "6–12+ years", note: "Insurance, pension, and credit union buyers may HTM under GAAP/statutory, avoiding mark-to-market volatility." },
                ].map((opt) => (
                  <div key={opt.strategy} className="flex items-start gap-2 rounded-lg border border-slate-100 px-2.5 sm:px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">{opt.strategy}</span>
                      <span className="ml-1.5 sm:ml-2 text-[9px] sm:text-[10px] text-slate-400">{opt.timeline}</span>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed break-words">{opt.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="border-t border-slate-200/70 pt-3 text-[11px] text-slate-400 space-y-0.5">
          <p>* Metrics calculated on selected loans only. &nbsp; ** Teraverde Indicative Pricing — not a commitment to transact. For firm bid, engage Teraverde Capital Markets desk.</p>
          <p>Risk factors, capital treatment, and buyer match scores are informational estimates based on publicly available regulatory guidance (OCC, FDIC, NAIC, NCUA, Basel Committee) and are not legal or investment advice.</p>
          <p className="mt-1">© Teraverde Financial LLC · SprinkleX Analytics Platform · All rights reserved.</p>
        </div>
      </footer>
    </SprinkleShell>
  );
}
