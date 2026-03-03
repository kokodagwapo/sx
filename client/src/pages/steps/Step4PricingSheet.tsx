import { useState, useCallback, useMemo } from "react";
import {
  Table2,
  Hash,
  Package,
  Banknote,
  Percent,
  Home,
  DollarSign,
  TrendingUp,
  Scale,
  List,
  CircleDollarSign,
  LayoutList,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  Minus,
} from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import { step4PricingRows, type PricingRow } from "@/data/mock/step4";
import { ExportButton } from "@/components/importExport/ExportButton";
import { ImportButton } from "@/components/importExport/ImportButton";
import { exportPricingToCSV } from "@/data/csv/csvExporter";
import { exportPricingToExcel } from "@/data/excel/excelExporter";
import { loanToPricingRow } from "@/data/converters";
import type { LoanRecord } from "@/data/types/loanRecord";
import type { KpiItem } from "@/components/step/KpiStrip";
import { buildLlpaWaterfall, type LlpaInputLoan } from "@/data/mock/llpaTables";
import { cn } from "@/lib/utils";

const STEP4_KPIS: KpiItem[] = [
  { label: "Total UPB",           value: "$1.53B",  icon: Banknote },
  { label: "Total Loans",         value: "6,293",   icon: LayoutList },
  { label: "Wtd Avg Coupon",      value: "4.13%",   icon: Percent },
  { label: "Bond Equiv Yield*",   value: "3.73%",   icon: TrendingUp },
  { label: "Wtd Avg Duration*",   value: "7.51 yrs",icon: Clock },
  { label: "Wtd Price Indication**", value: "103.05", icon: Scale },
];

const PRICING_COLUMNS = [
  sortableColumn<PricingRow>("tvm", "TVMA Inventory #", {
    icon: Hash,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<PricingRow>("product", "Product Type", {
    icon: Package,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<PricingRow>("upb", "UPB", {
    icon: Banknote,
    sortingFn: "numeric",
    cell: ({ getValue }) =>
      (getValue() as number)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—",
  }),
  sortableColumn<PricingRow>("rate", "Interest Rate", {
    icon: Percent,
    sortingFn: "numeric",
    cell: ({ getValue }) => (getValue() as number)?.toFixed(3) ?? "—",
  }),
  sortableColumn<PricingRow>("occupancy", "Occupancy", {
    icon: Home,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<PricingRow>("basePrice", "Base Price", {
    icon: DollarSign,
    sortingFn: "numeric",
    cell: ({ getValue }) => (getValue() as number)?.toFixed(3) ?? "—",
  }),
  sortableColumn<PricingRow>("priceAdj", "Price Adjuster", {
    icon: TrendingUp,
    sortingFn: "numeric",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      if (v == null) return "—";
      return <span className={v < 0 ? "text-rose-600/90" : "text-emerald-700/90"}>{v.toFixed(3)}</span>;
    },
  }),
  sortableColumn<PricingRow>("ltvFicoAdj", "LTV/FICO Adjuster", {
    icon: Scale,
    sortingFn: "numeric",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      if (v == null) return "—";
      return <span className={v < 0 ? "text-rose-600/90" : "text-emerald-700/90"}>{v.toFixed(3)}</span>;
    },
  }),
  sortableColumn<PricingRow>("otherLlpas", "Other LLPAs", {
    icon: List,
    sortingFn: "numeric",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      if (v == null) return "—";
      const str = v === 0 ? "0" : v.toFixed(3);
      return <span className={v < 0 ? "text-rose-600/90" : v > 0 ? "text-emerald-700/90" : "text-slate-500"}>{str}</span>;
    },
  }),
  sortableColumn<PricingRow>("finalPrice", "Final Price", {
    icon: CircleDollarSign,
    sortingFn: "numeric",
    cell: ({ getValue }) => <span className="font-semibold">{(getValue() as number)?.toFixed(3) ?? "—"}</span>,
  }),
];

function LlpaCalculator({ rows }: { rows: PricingRow[] }) {
  const [selectedTvm, setSelectedTvm] = useState<string>(rows[0]?.tvm ?? "");
  const [expanded, setExpanded] = useState(true);

  const selectedRow = useMemo(() => rows.find((r) => r.tvm === selectedTvm) ?? rows[0], [rows, selectedTvm]);

  const loanInput: LlpaInputLoan | null = selectedRow ? {
    tvm: selectedRow.tvm,
    product: selectedRow.product,
    upb: selectedRow.upb,
    rate: selectedRow.rate,
    occupancy: selectedRow.occupancy,
    basePrice: selectedRow.basePrice,
    priceAdj: selectedRow.priceAdj,
    ltv: selectedRow.ltv,
    fico: selectedRow.fico,
    units: selectedRow.units,
    propertyType: selectedRow.propertyType,
    term: selectedRow.term,
    loanType: undefined,
    selfEmployed: false,
  } : null;

  const waterfall = useMemo(() => loanInput ? buildLlpaWaterfall(loanInput) : [], [loanInput]);
  const finalRow = waterfall.find((r) => r.isFinal);

  return (
    <PanelCard
      className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
      icon={Calculator}
      title="LLPA Breakdown & Final Price"
      subtitle="Pricing waterfall per BRD §3.1.3 — select any loan to see full LLPA breakdown"
      right={
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/70 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Collapse" : "Expand"}
        </button>
      }
    >
      {/* Loan selector */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Loan:</label>
        <select
          className="flex-1 min-w-[200px] max-w-xs rounded-lg border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          value={selectedTvm}
          onChange={(e) => setSelectedTvm(e.target.value)}
        >
          {rows.map((r) => (
            <option key={r.tvm} value={r.tvm}>
              {r.tvm} — {r.product} | ${r.upb.toLocaleString()} | {r.rate.toFixed(3)}%
            </option>
          ))}
        </select>

        {finalRow && (
          <div className="flex items-center gap-2 rounded-lg bg-sky-50/80 border border-sky-200/60 px-3 py-1.5">
            <span className="text-xs text-sky-700 font-medium">Final Price:</span>
            <span className="text-sm font-bold text-sky-800 tabular-nums">{finalRow.value.toFixed(3)}</span>
          </div>
        )}
      </div>

      {expanded && loanInput && (
        <div className="space-y-3">
          {/* Loan info strip */}
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-100/80 bg-slate-50/50 px-3 py-2 text-xs text-slate-600">
            <span><strong>Product:</strong> {loanInput.product}</span>
            <span className="text-slate-300">|</span>
            <span><strong>UPB:</strong> ${loanInput.upb.toLocaleString()}</span>
            <span className="text-slate-300">|</span>
            <span><strong>Rate:</strong> {loanInput.rate.toFixed(3)}%</span>
            <span className="text-slate-300">|</span>
            <span><strong>Occupancy:</strong> {loanInput.occupancy}</span>
            {loanInput.fico && <><span className="text-slate-300">|</span><span><strong>FICO:</strong> {loanInput.fico}</span></>}
            {loanInput.ltv && <><span className="text-slate-300">|</span><span><strong>LTV:</strong> {loanInput.ltv.toFixed(1)}%</span></>}
          </div>

          {/* Waterfall table */}
          <div className="overflow-hidden rounded-xl border border-slate-200/70">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/80">
                  <th className="py-2.5 pl-4 pr-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Adjustment</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Rule Applied</th>
                  <th className="py-2.5 pl-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Value</th>
                </tr>
              </thead>
              <tbody>
                {waterfall.map((row, i) => {
                  const isZero = row.value === 0 && !row.isFinal;
                  const isNeg = row.value < 0;
                  const isPos = row.value > 0 && !row.isFinal;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-slate-100/70 transition-colors",
                        row.isFinal
                          ? "bg-sky-50/60 border-sky-200/60"
                          : i % 2 === 0
                            ? "bg-white/70"
                            : "bg-slate-50/40"
                      )}
                    >
                      <td className={cn("py-2.5 pl-4 pr-2 font-medium", row.isFinal ? "text-sky-800 font-bold" : "text-slate-800")}>
                        {row.label}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{row.rule}</td>
                      <td className={cn(
                        "py-2.5 pl-2 pr-4 text-right tabular-nums font-semibold",
                        row.isFinal ? "text-sky-800 text-base font-bold" :
                        isNeg ? "text-rose-600" :
                        isPos ? "text-emerald-700" :
                        isZero ? "text-slate-400" : "text-slate-700"
                      )}>
                        <span className="flex items-center justify-end gap-0.5">
                          {!row.isFinal && isNeg && <span className="text-rose-400 text-[10px]">▼</span>}
                          {!row.isFinal && isPos && <span className="text-emerald-400 text-[10px]">▲</span>}
                          {!row.isFinal && isZero && <Minus className="h-3 w-3 text-slate-300" />}
                          {isZero ? "—" : row.value.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            LLPA adjustments based on Fannie Mae Loan-Level Price Adjustment Matrix (2024). Negative values reduce price; positive values increase price.
          </p>
        </div>
      )}
    </PanelCard>
  );
}

export default function Step4PricingSheet() {
  const [rows, setRows] = useState<PricingRow[]>(step4PricingRows);

  const handleImport = useCallback((imported: LoanRecord[]) => {
    const pricingRows = imported.map(loanToPricingRow);
    setRows((prev) => [...pricingRows, ...prev]);
  }, []);

  const exportCSV = useCallback((data: PricingRow[]) => exportPricingToCSV(data), []);
  const exportExcel = useCallback((data: PricingRow[]) => exportPricingToExcel(data), []);

  return (
    <SprinkleShell stepId="4" kpis={STEP4_KPIS} animateKpis>
      <div className="space-y-4">
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
          icon={Table2}
          title="Detail of Pricing for Selected Loans"
          subtitle="Pricing data as of 7/1/2024 5:00 PM Eastern"
          right={
            <div className="flex items-center gap-2">
              <ImportButton onImport={handleImport} />
              <ExportButton
                data={rows}
                filename="pricing_sheet"
                exportCSV={exportCSV}
                exportExcel={exportExcel}
              />
            </div>
          }
        >
          <div className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2">
            <DataTable data={rows} columns={PRICING_COLUMNS} height={480} animateRows />
          </div>
        </PanelCard>

        <LlpaCalculator rows={rows} />

        <footer className="border-t border-slate-200/70 pt-4 text-xs text-slate-500">
          <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
          <p className="mt-1">LLPA values reference Fannie Mae standard adjustment matrix. Teraverde Financial LLC. 2026. All rights reserved.</p>
        </footer>
      </div>
    </SprinkleShell>
  );
}
