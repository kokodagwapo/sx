import { useState } from "react";
import {
  LineChart,
  Banknote,
  TrendingUp,
  Sparkles,
  Percent,
  LayoutList,
  Clock,
  Scale,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { TourBubble } from "@/components/onboarding/TourBubble";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import {
  step6bYieldTrend,
  step6bQuarterDrilldown,
  step6bKpiDrilldown,
  step6bCurrentDrilldown,
  step6bProjectedDrilldown,
  type MetricDrilldown,
  type QuarterDrilldown,
} from "@/data/mock/step6b";
import type { KpiItem } from "@/components/step/KpiStrip";

const STEP6B_KPIS: KpiItem[] = [
  { id: "upb", label: "Total Unpaid Principal Balance (UPB)", value: "1,534,248,974", icon: Banknote },
  { id: "loans", label: "Total Loans Meeting Criteria", value: "6,293", icon: LayoutList },
  { id: "coupon", label: "Weighted Average Coupon*", value: "4.13", icon: Percent },
  { id: "bey", label: "Bond Equivalent Yield*", value: "3.73", icon: TrendingUp },
  { id: "duration", label: "Weighted Average Duration*", value: "7.51", icon: Clock },
  { id: "price", label: "Weighted Price Indication**", value: "103.05", icon: Scale },
];

type DrilldownType = "kpi" | "quarter" | "current" | "projected" | null;

function DrilldownPanel({
  title,
  subtitle,
  data,
  onClose,
  type,
}: {
  title: string;
  subtitle?: string;
  data: MetricDrilldown | QuarterDrilldown;
  onClose: () => void;
  type: "metric" | "quarter";
}) {
  const isQuarter = type === "quarter";
  const d = data as QuarterDrilldown;
  const m = data as MetricDrilldown;

  return (
    <PanelCard
      className="border-violet-200/60 bg-violet-50/30 opacity-0 animate-fade-in-up"
      icon={Sparkles}
      title={title}
      subtitle={subtitle}
      right={
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" /> Close
        </button>
      }
    >
      {isQuarter ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Yield
              </div>
              <div className="mt-1 text-xl font-bold text-violet-700">{d.yield}%</div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Total Loans
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-slate-800">
                ${d.totalLoans}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Avg Loan Size
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-slate-800">
                ${d.avgLoanSize}
              </div>
            </div>
          </div>
          {d.loanTypeBreakdown && d.loanTypeBreakdown.length > 0 && (
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Loan Type Mix
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {d.loanTypeBreakdown.map((b, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-violet-100/80 px-2 py-1 text-xs font-medium text-violet-800"
                  >
                    {b.type}: {b.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}
          <ul className="space-y-2">
            {d.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Definition
            </div>
            <p className="mt-2 text-sm text-slate-700">{m.definition}</p>
          </div>
          {m.components && m.components.length > 0 && (
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Components
              </div>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {m.components.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
          <ul className="space-y-2">
            {m.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}

function Big({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 transition-all hover:border-violet-200/70 hover:bg-violet-50/40",
        onClick && "cursor-pointer"
      )}
    >
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums [font-family:var(--font-display)]">
        {value}
      </div>
    </div>
  );
}

export default function Step6bYields() {
  const [drilldown, setDrilldown] = useState<{
    type: DrilldownType;
    id: string;
  } | null>(null);

  const handleKpiClick = (item: KpiItem) => {
    const id = item.id ?? item.label;
    if (step6bKpiDrilldown[id]) {
      setDrilldown((prev) => (prev?.type === "kpi" && prev.id === id ? null : { type: "kpi", id }));
    }
  };

  const handleQuarterClick = (name: string) => {
    setDrilldown((prev) =>
      prev?.type === "quarter" && prev.id === name ? null : { type: "quarter", id: name }
    );
  };

  const handleCurrentClick = (id: string) => {
    setDrilldown((prev) =>
      prev?.type === "current" && prev.id === id ? null : { type: "current", id }
    );
  };

  const handleProjectedClick = (id: string) => {
    setDrilldown((prev) =>
      prev?.type === "projected" && prev.id === id ? null : { type: "projected", id }
    );
  };

  const closeDrilldown = () => setDrilldown(null);

  const kpiDrilldownData = drilldown?.type === "kpi" ? step6bKpiDrilldown[drilldown.id] : null;
  const quarterDrilldownData =
    drilldown?.type === "quarter" ? step6bQuarterDrilldown[drilldown.id] : null;
  const currentDrilldownData =
    drilldown?.type === "current" ? step6bCurrentDrilldown[drilldown.id] : null;
  const projectedDrilldownData =
    drilldown?.type === "projected" ? step6bProjectedDrilldown[drilldown.id] : null;

  return (
    <SprinkleShell
      stepId="6b"
      kpis={STEP6B_KPIS}
      animateKpis
      onKpiClick={(item) => item.id && handleKpiClick(item)}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Historical Loan Yields */}
        <PanelCard
          className="col-span-1 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1 lg:col-span-7"
          icon={LineChart}
          title="Historical Loan Yields — Last Five Quarters"
          subtitle="Total Loans and Leases • Click a data point for drilldown"
        >
          <div className="h-[420px]">
            <AreaTrendChart
              data={step6bYieldTrend}
              gradientId="step6b-trendFill"
              onPointClick={handleQuarterClick}
            />
          </div>
        </PanelCard>

        {/* Portfolio Comparison Panels */}
        <div className="col-span-1 grid gap-4 lg:col-span-5 lg:grid-rows-2">
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={Banknote}
            title="As of Last Quarter"
            subtitle="Annualized • Click metrics for details"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <Big
                label="Total Interest Income (Loans)"
                value="36,061,856"
                onClick={() => handleCurrentClick("interestIncome")}
              />
              <Big
                label="Total Loans & Leases"
                value="762,716,000"
                onClick={() => handleCurrentClick("totalLoans")}
              />
              <Big
                label="Current Portfolio Yield^"
                value="4.71"
                onClick={() => handleCurrentClick("yield")}
              />
            </div>
          </PanelCard>
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-3"
            icon={TrendingUp}
            title="Projected Portfolio"
            subtitle="Annualized • Click metrics for details"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <Big
                label="Total Interest Income (Loans)"
                value="93,338,080"
                onClick={() => handleProjectedClick("interestIncome")}
              />
              <Big
                label="Total Loans & Leases"
                value="2,296,964,974"
                onClick={() => handleProjectedClick("totalLoans")}
              />
              <Big
                label="Bond Equivalent Yield^^"
                value="4.06"
                onClick={() => handleProjectedClick("yield")}
              />
            </div>
          </PanelCard>
        </div>
      </div>

      {/* Drilldown Panels */}
      {kpiDrilldownData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${kpiDrilldownData.label}`}
            subtitle="Executive insight"
            data={kpiDrilldownData}
            onClose={closeDrilldown}
            type="metric"
          />
        </div>
      )}
      {quarterDrilldownData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Quarter: ${quarterDrilldownData.quarter}`}
            subtitle={`Yield: ${quarterDrilldownData.yield}%`}
            data={quarterDrilldownData}
            onClose={closeDrilldown}
            type="quarter"
          />
        </div>
      )}
      {currentDrilldownData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Current: ${currentDrilldownData.label}`}
            subtitle="As of Last Quarter"
            data={currentDrilldownData}
            onClose={closeDrilldown}
            type="metric"
          />
        </div>
      )}
      {projectedDrilldownData && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Projected: ${projectedDrilldownData.label}`}
            subtitle="Projected Portfolio"
            data={projectedDrilldownData}
            onClose={closeDrilldown}
            type="metric"
          />
        </div>
      )}

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>
          * Selected Loans &nbsp; ** Teraverde Indicative Pricing &nbsp; ^ Based on Avg Total Loans
          &nbsp; ^^ Includes selected loans
        </p>
        <p className="mt-1">Teraverde Financial LLC, 2016–2017. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
