import { useState, useCallback } from "react";
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

const STEP4_KPIS: KpiItem[] = [
  { label: "Total Unpaid Principal Balance (UPB)", value: "1,534,248,974", icon: Banknote },
  { label: "Total Loans Meeting Criteria", value: "6,293", icon: LayoutList },
  { label: "Weighted Average Coupon", value: "4.13", icon: Percent },
  { label: "Bond Equivalent Yield*", value: "3.73", icon: TrendingUp },
  { label: "Weighted Average Duration*", value: "7.51", icon: Clock },
  { label: "Weighted Price Indication**", value: "103.05", icon: Scale },
];

/** Pricing table columns — matches image layout */
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
      const neg = v < 0;
      return (
        <span className={neg ? "text-rose-600/90" : "text-emerald-700/90"}>
          {v.toFixed(3)}
        </span>
      );
    },
  }),
  sortableColumn<PricingRow>("ltvFicoAdj", "LTV/FICO Adjuster", {
    icon: Scale,
    sortingFn: "numeric",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      if (v == null) return "—";
      const neg = v < 0;
      return (
        <span className={neg ? "text-rose-600/90" : "text-emerald-700/90"}>
          {v.toFixed(3)}
        </span>
      );
    },
  }),
  sortableColumn<PricingRow>("otherLlpas", "Other LLPAs", {
    icon: List,
    sortingFn: "numeric",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      if (v == null) return "—";
      const neg = v < 0;
      const str = v === 0 ? "0" : v % 1 === 0 ? String(v) : v.toFixed(2);
      return (
        <span className={neg ? "text-rose-600/90" : "text-emerald-700/90"}>
          {str}
        </span>
      );
    },
  }),
  sortableColumn<PricingRow>("finalPrice", "Final Price", {
    icon: CircleDollarSign,
    sortingFn: "numeric",
    cell: ({ getValue }) => (getValue() as number)?.toFixed(3) ?? "—",
  }),
];

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
        {/* Detail of Pricing — modern card */}
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
            <DataTable data={rows} columns={PRICING_COLUMNS} height={560} animateRows />
          </div>
        </PanelCard>

        <footer className="border-t border-slate-200/70 pt-4 text-xs text-slate-500">
          <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
          <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
        </footer>
      </div>
    </SprinkleShell>
  );
}
