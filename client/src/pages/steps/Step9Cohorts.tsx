import { useState, useMemo } from "react";
import { BarChart2, Layers, DollarSign, Percent, CreditCard, TrendingUp, Hash, Banknote, Scale } from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { TourBubble } from "@/components/onboarding/TourBubble";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { getCohortData, COHORT_CONFIGS, type CohortDimension, type CohortRow } from "@/data/mock/step9";
import { cn } from "@/lib/utils";
import type { KpiItem } from "@/components/step/KpiStrip";

const DIMENSIONS: { id: CohortDimension; label: string }[] = [
  { id: "units",       label: "By Units" },
  { id: "product",     label: "By Product" },
  { id: "vintage",     label: "By Vintage" },
  { id: "rateBucket",  label: "By Rate" },
  { id: "ltvBucket",   label: "By LTV" },
  { id: "geography",   label: "By State" },
];

const COHORT_COLUMNS = [
  sortableColumn<CohortRow>("label", "Cohort", { sortingFn: "string", cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue() as string}</span> }),
  sortableColumn<CohortRow>("loanCount", "Loan Count", { sortingFn: "numeric", cell: ({ getValue }) => (getValue() as number).toLocaleString() }),
  sortableColumn<CohortRow>("totalUpb", "Total UPB", { sortingFn: "numeric", cell: ({ getValue }) => "$" + ((getValue() as number) / 1_000_000).toFixed(1) + "M" }),
  sortableColumn<CohortRow>("avgBalance", "Avg Balance", { sortingFn: "numeric", cell: ({ getValue }) => "$" + (getValue() as number).toLocaleString() }),
  sortableColumn<CohortRow>("wac", "WAC (%)", { sortingFn: "numeric", cell: ({ getValue }) => (getValue() as number).toFixed(3) + "%" }),
  sortableColumn<CohortRow>("avgFico", "Avg FICO", { sortingFn: "numeric", cell: ({ getValue }) => (getValue() as number).toString() }),
  sortableColumn<CohortRow>("avgLtv", "Avg LTV (%)", { sortingFn: "numeric", cell: ({ getValue }) => (getValue() as number).toFixed(1) + "%" }),
  sortableColumn<CohortRow>("avgDti", "Avg DTI (%)", { sortingFn: "numeric", cell: ({ getValue }) => (getValue() as number).toFixed(1) + "%" }),
];

export default function Step9Cohorts() {
  const [dimension, setDimension] = useState<CohortDimension>("units");
  const cohorts = useMemo(() => getCohortData(dimension), [dimension]);

  const kpis: KpiItem[] = useMemo(() => {
    const totalLoans = cohorts.reduce((s, c) => s + c.loanCount, 0);
    const totalUpb = cohorts.reduce((s, c) => s + c.totalUpb, 0);
    const avgBalance = totalLoans > 0 ? totalUpb / totalLoans : 0;
    const wac = totalUpb > 0 ? cohorts.reduce((s, c) => s + c.wac * c.totalUpb, 0) / totalUpb : 0;
    const avgFico = cohorts.length > 0 ? cohorts.reduce((s, c) => s + c.avgFico, 0) / cohorts.length : 0;
    const avgLtv = cohorts.length > 0 ? cohorts.reduce((s, c) => s + c.avgLtv, 0) / cohorts.length : 0;
    return [
      { label: "Cohort Groups", value: String(cohorts.length), icon: Layers },
      { label: "Total Loans", value: totalLoans.toLocaleString(), icon: Hash },
      { label: "Total UPB", value: "$" + (totalUpb / 1_000_000).toFixed(1) + "M", icon: Banknote },
      { label: "Avg Loan Balance", value: "$" + Math.round(avgBalance).toLocaleString(), icon: DollarSign },
      { label: "Wtd Avg Coupon", value: wac.toFixed(3) + "%", icon: Percent },
      { label: "Avg FICO / LTV", value: Math.round(avgFico) + " / " + avgLtv.toFixed(0) + "%", icon: CreditCard },
    ];
  }, [cohorts]);

  const barData = useMemo(
    () => cohorts.map(c => ({ name: c.label, value: Math.round(c.totalUpb / 1_000_000) })),
    [cohorts],
  );

  const scatterData = useMemo(
    () => cohorts.map(c => ({ x: c.wac, y: c.avgBalance / 1_000, name: c.label })),
    [cohorts],
  );

  const cfg = COHORT_CONFIGS[dimension];

  return (
    <SprinkleShell stepId="9" kpis={kpis} animateKpis>
      <div className="space-y-4">
        {/* Dimension selector */}
        <PanelCard
          className="opacity-0 animate-fade-in-up"
          icon={Layers}
          title="Cohort Analysis"
          subtitle="Group the loan pool by any dimension to compare performance metrics"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {DIMENSIONS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDimension(d.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 border",
                  dimension === d.id
                    ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                    : "bg-white/50 text-slate-600 border-white/50 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-sky-100/60 bg-sky-50/30 px-3 py-2">
            <div className="text-sm font-semibold text-sky-800">{cfg.title}</div>
            <div className="text-xs text-sky-700/70 mt-0.5">{cfg.description}</div>
          </div>
        </PanelCard>

        {/* Charts */}
        <div className="grid grid-cols-12 gap-4">
          <PanelCard
            className="col-span-12 lg:col-span-7 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
            icon={BarChart2}
            title="Total UPB by Cohort ($M)"
            subtitle="Unpaid principal balance per group"
          >
            <div style={{ height: Math.max(240, cohorts.length * 44) }}>
              <HorizontalBarChart data={barData} showValueLabels />
            </div>
          </PanelCard>

          <PanelCard
            className="col-span-12 lg:col-span-5 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
            icon={TrendingUp}
            title="Avg Balance vs WAC"
            subtitle="Bubble size = loan count"
          >
            <div className="h-[280px]">
              <ScatterPlot
                data={scatterData}
                xLabel="WAC (%)"
                yLabel="Avg Balance ($K)"
              />
            </div>
          </PanelCard>
        </div>

        {/* Metrics table */}
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
          icon={Scale}
          title="Cohort Metrics Comparison"
          subtitle="Sortable — click any column header"
        >
          <DataTable data={cohorts} columns={COHORT_COLUMNS} height={420} stripeRows animateRows />
        </PanelCard>

        {/* Cohort detail cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-0 animate-fade-in-up animate-fade-in-up-delay-3">
          {cohorts.map((c, i) => {
            const colors = [
              "from-sky-50 border-sky-100", "from-violet-50 border-violet-100",
              "from-mint-50 border-emerald-100", "from-amber-50 border-amber-100",
              "from-pink-50 border-pink-100", "from-blue-50 border-blue-100",
            ];
            const cls = colors[i % colors.length];
            return (
              <div key={c.label} className={cn("rounded-xl border bg-gradient-to-b to-white p-4 shadow-sm", cls)}>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{c.label}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Loans</div>
                    <div className="font-bold text-slate-800">{c.loanCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total UPB</div>
                    <div className="font-bold text-slate-800">${(c.totalUpb / 1_000_000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg Balance</div>
                    <div className="font-semibold text-slate-700">${c.avgBalance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">WAC</div>
                    <div className="font-semibold text-slate-700">{c.wac.toFixed(3)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg FICO</div>
                    <div className="font-semibold text-slate-700">{c.avgFico}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg LTV</div>
                    <div className="font-semibold text-slate-700">{c.avgLtv.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="border-t border-slate-200/70 pt-4 text-xs text-slate-500">
          <p>Cohort metrics calculated from the active loan pool. WAC = Weighted Average Coupon weighted by UPB.</p>
          <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
        </footer>
      </div>
    </SprinkleShell>
  );
}
