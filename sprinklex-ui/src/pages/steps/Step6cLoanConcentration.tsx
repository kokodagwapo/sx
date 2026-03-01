import { useState } from "react";
import {
  BarChart2,
  Table2,
  Banknote,
  AlertCircle,
  FileText,
  Sparkles,
  TrendingUp,
  X,
  Shield,
} from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import {
  step6cProForma,
  step6cRecent,
  step6cTableRecent,
  step6cTableProForma,
  step6cCapitalRecent,
  step6cCapitalProForma,
  step6cLoanDrilldown,
  step6cCapitalDrilldown,
  type ConcentrationRow,
  type LoanTypeDrilldown,
  type CapitalMetricDrilldown,
} from "@/data/mock/step6c";
import { baseKpis } from "@/data/mock/kpis";
import { cn } from "@/lib/utils";

const CURRENT_BAR_COLOR = "#3b82f6";
const PROFORMA_BAR_COLOR = "#dc2626";

const columns = [
  sortableColumn<ConcentrationRow>("loanType", "Loan Type", { icon: FileText }),
  sortableColumn<ConcentrationRow>("loanBalance", "Loan Balances", {
    icon: Banknote,
    cell: ({ getValue }) => Intl.NumberFormat("en-US").format(getValue() as number),
    sortingFn: "numeric",
  }),
  sortableColumn<ConcentrationRow>("pastDueNonAccrual", "Past Due & Non-accrual", {
    icon: AlertCircle,
    cell: ({ getValue }) => Intl.NumberFormat("en-US").format(getValue() as number),
    sortingFn: "numeric",
  }),
];

function getLoanDrilldown(loanType: string): LoanTypeDrilldown | null {
  return step6cLoanDrilldown[loanType] ?? null;
}

function DrilldownPanel({
  title,
  data,
  onClose,
  type,
}: {
  title: string;
  data: LoanTypeDrilldown | CapitalMetricDrilldown;
  onClose: () => void;
  type: "loan" | "capital";
}) {
  if (type === "loan") {
    const d = data as LoanTypeDrilldown;
    const riskColors = { low: "text-emerald-600", medium: "text-amber-600", high: "text-rose-600" };
    return (
      <PanelCard
        className="border-sky-200/60 bg-sky-50/30 opacity-0 animate-fade-in-up"
        icon={Sparkles}
        title={title}
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
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Definition
            </div>
            <p className="mt-2 text-sm text-slate-700">{d.definition}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Recent %
              </div>
              <div className="mt-1 text-lg font-bold text-sky-600">{d.recentPct.toFixed(1)}%</div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Pro forma %
              </div>
              <div className="mt-1 text-lg font-bold text-rose-600">{d.proFormaPct.toFixed(1)}%</div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Risk Level
              </div>
              <div className={cn("mt-1 text-lg font-semibold capitalize", riskColors[d.riskLevel])}>
                {d.riskLevel}
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {d.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </PanelCard>
    );
  }

  const c = data as CapitalMetricDrilldown;
  const isPct = c.label.includes("Ratio");
  const fmt = (v: number) => (isPct ? `${v.toFixed(2)}%` : v.toLocaleString());
  const fmtDelta = (v: number) => (isPct ? `${v >= 0 ? "+" : ""}${v.toFixed(2)} pp` : (v >= 0 ? "+" : "") + v.toLocaleString());
  return (
    <PanelCard
      className="border-violet-200/60 bg-violet-50/30 opacity-0 animate-fade-in-up"
      icon={Shield}
      title={title}
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
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Definition
          </div>
          <p className="mt-2 text-sm text-slate-700">{c.definition}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Most Recent
            </div>
            <div className="mt-1 text-lg font-bold text-sky-600">{fmt(c.recentValue)}</div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Pro forma
            </div>
            <div className="mt-1 text-lg font-bold text-rose-600">{fmt(c.proFormaValue)}</div>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Change
            </div>
            <div
              className={cn(
                "mt-1 text-lg font-semibold",
                c.delta >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {fmtDelta(c.delta)}
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {c.insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </PanelCard>
  );
}

function KpiBlock({
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
        "rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 transition-all hover:border-emerald-200/70 hover:bg-emerald-50/40",
        onClick && "cursor-pointer"
      )}
    >
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-emerald-700 tabular-nums [font-family:var(--font-display)]">
        {value}
      </div>
    </div>
  );
}

export default function Step6cLoanConcentration() {
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);

  const loanDrilldown = selectedLoanType ? getLoanDrilldown(selectedLoanType) : null;
  const capitalDrilldown = selectedCapital ? step6cCapitalDrilldown[selectedCapital] : null;

  const handleLoanSelect = (loanType: string) => {
    setSelectedLoanType((prev) => (prev === loanType ? null : loanType));
    setSelectedCapital(null);
  };

  const handleCapitalSelect = (capitalId: string) => {
    setSelectedCapital((prev) => (prev === capitalId ? null : capitalId));
    setSelectedLoanType(null);
  };

  const closeDrilldown = () => {
    setSelectedLoanType(null);
    setSelectedCapital(null);
  };

  return (
    <SprinkleShell stepId="6c" kpis={baseKpis}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Most Recent Quarter */}
        <div className="space-y-4">
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
            icon={BarChart2}
            title="Loan Concentrations: Most Recent Quarter"
            subtitle="Based upon Call Report RC-C Loan Groups as of Most Recent Quarter • Loan Balances % of Tier 1 + ALLL • Click a bar for drilldown"
          >
            <div className="h-[320px]">
              <HorizontalBarChart
                data={step6cRecent}
                color={CURRENT_BAR_COLOR}
                unit="%"
                domain={[0, 600]}
                onBarClick={handleLoanSelect}
                showValueLabels
              />
            </div>
          </PanelCard>

          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={Table2}
            title="Major Loan Concentration Pools: Most Recent Quarter"
            subtitle="Dollars in Thousands • Click a row for drilldown"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8">
                <DataTable
                  data={step6cTableRecent}
                  columns={columns}
                  height={260}
                  animateRows
                  onRowClick={(row) => handleLoanSelect(row.loanType)}
                />
              </div>
              <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
                <KpiBlock
                  label="Tier 1 Capital"
                  value={step6cCapitalRecent.tier1Capital.toLocaleString()}
                  onClick={() => handleCapitalSelect("tier1Capital")}
                />
                <KpiBlock
                  label="Tier 1 Capital + ALLL"
                  value={step6cCapitalRecent.tier1PlusAlll.toLocaleString()}
                  onClick={() => handleCapitalSelect("tier1PlusAlll")}
                />
                <KpiBlock
                  label="Tier 1 Leverage Ratio"
                  value={`${step6cCapitalRecent.tier1LeverageRatio}%`}
                  onClick={() => handleCapitalSelect("tier1LeverageRatio")}
                />
              </div>
            </div>
          </PanelCard>
        </div>

        {/* Right: Pro forma */}
        <div className="space-y-4">
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
            icon={BarChart2}
            title="Loan Concentrations: Pro forma"
            subtitle="Based upon Call Report RC-C Loan Groups as of Most Recent Quarter • Loan Balances % of Tier 1 + ALLL • Click a bar for drilldown"
          >
            <div className="h-[320px]">
              <HorizontalBarChart
                data={step6cProForma}
                color={PROFORMA_BAR_COLOR}
                unit="%"
                domain={[0, 1800]}
                onBarClick={handleLoanSelect}
                showValueLabels
              />
            </div>
          </PanelCard>

          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={Table2}
            title="Major Loan Concentration Pools: Pro forma"
            subtitle="Dollars in Thousands • Click a row for drilldown"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8">
                <DataTable
                  data={step6cTableProForma}
                  columns={columns}
                  height={260}
                  animateRows
                  onRowClick={(row) => handleLoanSelect(row.loanType)}
                />
              </div>
              <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
                <KpiBlock
                  label="Tier 1 Capital"
                  value={step6cCapitalProForma.tier1Capital.toLocaleString()}
                  onClick={() => handleCapitalSelect("tier1Capital")}
                />
                <KpiBlock
                  label="Tier 1 Capital + ALLL"
                  value={step6cCapitalProForma.tier1PlusAlll.toLocaleString()}
                  onClick={() => handleCapitalSelect("tier1PlusAlll")}
                />
                <KpiBlock
                  label="Tier 1 Leverage Ratio"
                  value={`${step6cCapitalProForma.tier1LeverageRatio}%`}
                  onClick={() => handleCapitalSelect("tier1LeverageRatio")}
                />
              </div>
            </div>
          </PanelCard>
        </div>
      </div>

      {/* Drilldown Panels */}
      {loanDrilldown && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${loanDrilldown.loanType}`}
            data={loanDrilldown}
            onClose={closeDrilldown}
            type="loan"
          />
        </div>
      )}
      {capitalDrilldown && (
        <div className="mt-4">
          <DrilldownPanel
            title={`Drilldown: ${capitalDrilldown.label}`}
            data={capitalDrilldown}
            onClose={closeDrilldown}
            type="capital"
          />
        </div>
      )}

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>
          Total Non Real Estate includes Commercial & Industrial, Consumer Loans, and All Other Loans.
        </p>
      </footer>
    </SprinkleShell>
  );
}
