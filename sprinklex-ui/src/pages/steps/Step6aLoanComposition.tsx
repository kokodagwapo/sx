import { useState } from "react";
import { FileText, BarChart2, TrendingUp, Sparkles } from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { ComparisonHorizontalBarChart } from "@/components/charts/ComparisonHorizontalBarChart";
import { step6aComposition, step6aDrilldown } from "@/data/mock/step6a";
import { Banknote, LayoutList, Percent, TrendingUp as TrendIcon, Clock, Scale } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

const STEP6A_KPIS: KpiItem[] = [
  { label: "Total Unpaid Principal Balance (UPB)", value: "1,534,248,974", icon: Banknote },
  { label: "Total Loans Meeting Criteria", value: "6,293", icon: LayoutList },
  { label: "Weighted Average Coupon*", value: "4.13", icon: Percent },
  { label: "Bond Equivalent Yield*", value: "3.73", icon: TrendIcon },
  { label: "Weighted Average Duration*", value: "7.51", icon: Clock },
  { label: "Weighted Price Indication**", value: "103.05", icon: Scale },
];

const NARRATIVE_BULLETS = [
  "This chart measures As of Last Quarter and Projected with Selected Loans by loan type.",
  "On average, Projected with Selected Loans increases by 6 for each additional unit of As of Last Quarter across all loan types.",
  "Projected with Selected Loans has a higher degree of concentration among the top loan types.",
  "Total Real Estate Loans stands out with the highest values for both As of Last Quarter (558,489) and Projected with Selected Loans (2.9M).",
];

const AS_OF_LAST_QUARTER = [
  "Total As of Last Quarter is 2M across all nine loan types.",
  "Driven by Total Real Estate Loans (558,489), Comm RE(Nonfarm/NonRes) (320,511), and Total Non-Real Estate Loans (204,227).",
  "Min 387 (Farm Loans), Max 558,489 (Total Real Estate Loans); 71% concentrated in top 3 types (33% of categories).",
  "Total Real Estate Loans represents 37% of overall As of Last Quarter—more than 3× the average.",
];

const PROJECTED = [
  "Total Projected with Selected Loans is 5M across all nine loan types.",
  "Driven by Total Real Estate Loans (2.9M), Total 1-4 Family Loans (1.7M), and Comm RE(Nonfarm/NonRes) (320,511).",
  "Concentrated: just 2 of 9 types (22%) represent 82% of the total.",
  "Total Real Estate Loans represents 46% of pro-forma—more than 4× the average.",
];

export default function Step6aLoanComposition() {
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  const drilldown = selectedLoanType ? step6aDrilldown[selectedLoanType] : null;

  return (
    <SprinkleShell stepId="6a" kpis={STEP6A_KPIS} animateKpis>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Narrative */}
        <PanelCard
          className="col-span-1 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1 lg:col-span-5"
          icon={FileText}
          title="Loan Composition with Selections"
          subtitle="As of Last Quarter vs. Projected with Selected Loans"
        >
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <p>{NARRATIVE_BULLETS[0]}</p>
            <ul className="space-y-1.5 pl-4">
              {NARRATIVE_BULLETS.slice(1).map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-sky-500">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                For As of Last Quarter
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {AS_OF_LAST_QUARTER.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/50 px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                For Projected with Selected Loans
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {PROJECTED.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </PanelCard>

        {/* Right: Chart + Drilldown */}
        <div className="col-span-1 space-y-4 lg:col-span-7">
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={BarChart2}
            title="Loan Composition with Selections"
            subtitle="Dollars in Thousands • Click a bar for drilldown"
          >
            <div className="h-[400px]">
              <ComparisonHorizontalBarChart
                data={step6aComposition}
                currentLabel="As of Last Quarter"
                proFormaLabel="Projected with Selected Loans"
                currentColor="#3b82f6"
                proFormaColor="#dc2626"
                onBarClick={(name) => setSelectedLoanType((prev) => (prev === name ? null : name))}
              />
            </div>
          </PanelCard>

          {/* Drilldown panel */}
          {drilldown && (
            <PanelCard
              className="opacity-0 animate-fade-in-up border-emerald-200/60 bg-emerald-50/30"
              icon={Sparkles}
              title={`Drilldown: ${drilldown.loanType}`}
              subtitle="Executive insights"
              right={
                <button
                  type="button"
                  onClick={() => setSelectedLoanType(null)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Share & Change
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span>
                      Current: <strong>{drilldown.currentPct}%</strong>
                    </span>
                    <span>
                      Pro-forma: <strong>{drilldown.proFormaPct}%</strong>
                    </span>
                    <span
                      className={
                        drilldown.delta >= 0 ? "text-emerald-600" : "text-rose-600"
                      }
                    >
                      Δ {drilldown.delta >= 0 ? "+" : ""}
                      {drilldown.delta.toLocaleString()} ({drilldown.deltaPct >= 0 ? "+" : ""}
                      {drilldown.deltaPct}%)
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Concentration Rank
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-800">
                    #{drilldown.concentrationRank} of 9
                  </div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {drilldown.insights.map((insight, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}
        </div>
      </div>

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
