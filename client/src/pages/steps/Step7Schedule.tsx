import { useState, useCallback } from "react";
import { TourBubble } from "@/components/onboarding/TourBubble";
import {
  List,
  Hash,
  Banknote,
  Percent,
  Calendar,
  Target,
  CreditCard,
  Scale,
  Home,
  MapPin,
  Building,
  Package,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  FileText,
  LayoutList,
  CheckCircle2,
  Tag,
  Lock,
  AlertCircle,
} from "lucide-react";
import type { LoanStatus } from "@/data/types/loanRecord";
import { cn } from "@/lib/utils";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import {
  step7ScheduleRows,
  step7KpiDrilldown,
  type ScheduleRow,
  type KpiDrilldown,
} from "@/data/mock/step7";
import { ExportButton } from "@/components/importExport/ExportButton";
import { ImportButton } from "@/components/importExport/ImportButton";
import { exportScheduleToCSV } from "@/data/csv/csvExporter";
import { exportScheduleToExcel } from "@/data/excel/excelExporter";
import { loanToScheduleRow } from "@/data/converters";
import type { LoanRecord } from "@/data/types/loanRecord";
import type { KpiItem } from "@/components/step/KpiStrip";
const STEP7_KPIS: KpiItem[] = [
  { id: "upb", label: "Total Unpaid Principal Balance (UPB)", value: "1,861,333,635", icon: Banknote },
  { id: "loans", label: "Total Loans Meeting Criteria", value: "7,050", icon: LayoutList },
  { id: "coupon", label: "Weighted Average Coupon*", value: "3.50", icon: Percent },
  { id: "bey", label: "Bond Equivalent Yield*", value: "3.17", icon: TrendingUp },
  { id: "duration", label: "Weighted Average Duration*", value: "6.80", icon: Clock },
  { id: "price", label: "Weighted Price Indication**", value: "100.71", icon: Scale },
];

type DrilldownType = "kpi" | "loan" | null;

function DrilldownPanel({
  title,
  data,
  onClose,
  type,
}: {
  title: string;
  data: KpiDrilldown | ScheduleRow;
  onClose: () => void;
  type: "kpi" | "loan";
}) {
  if (type === "kpi") {
    const k = data as KpiDrilldown;
    return (
      <PanelCard
        className="border-emerald-200/60 bg-emerald-50/30 opacity-0 animate-fade-in-up"
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
            <p className="mt-2 text-sm text-slate-700">{k.definition}</p>
          </div>
          <ul className="space-y-2">
            {k.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </PanelCard>
    );
  }

  const loan = data as ScheduleRow;
  const fields = [
    { label: "TVMA Inventory #", value: loan.tvm },
    { label: "Source", value: loan.source ?? "—" },
    { label: "Loan Amount", value: Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(loan.loanAmount) },
    { label: "UPB", value: Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(loan.upb) },
    { label: "Interest Rate", value: loan.rate.toFixed(3) },
    { label: "First Payment Date", value: loan.firstPaymentDate },
    { label: "Purpose", value: loan.purpose },
    { label: "FICO", value: loan.fico },
    { label: "LTV", value: `${loan.ltv.toFixed(2)}%` },
    { label: "CLTV", value: `${loan.cltv.toFixed(2)}%` },
    { label: "DTI", value: `${loan.dti.toFixed(2)}%` },
    { label: "Occupancy", value: loan.occupancy },
    { label: "Property Address", value: loan.propertyAddress ?? "—" },
    { label: "City", value: loan.city },
    { label: "County", value: loan.county ?? "—" },
    { label: "State", value: loan.state },
    { label: "Property Type", value: loan.propertyType },
    { label: "Units", value: loan.units },
    { label: "Product Type", value: loan.productType },
    { label: "Term", value: loan.term },
    { label: "Lien Position", value: loan.lienPosition ?? "—" },
  ];

  return (
    <PanelCard
      className="border-sky-200/60 bg-sky-50/30 opacity-0 animate-fade-in-up"
      icon={List}
      title={title}
      subtitle={loan.tvm}
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div key={f.label} className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {f.label}
            </div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-slate-800">{f.value}</div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

const STATUS_CONFIG: Record<LoanStatus, { badge: string; icon: typeof CheckCircle2; dot: string }> = {
  Available:  { badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  Allocated:  { badge: "bg-amber-100/80  text-amber-700  border-amber-200",    icon: Tag,          dot: "bg-amber-500"   },
  Committed:  { badge: "bg-sky-100/80    text-sky-700    border-sky-200",       icon: Lock,         dot: "bg-sky-500"     },
  Sold:       { badge: "bg-slate-100/80  text-slate-600  border-slate-200",     icon: AlertCircle,  dot: "bg-slate-400"   },
};

function StatusBadge({ status }: { status?: LoanStatus }) {
  if (!status) return <span className="text-slate-400 text-xs">—</span>;
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

const columns = [
  sortableColumn<ScheduleRow>("tvm", "TVMA Inventory #", {
    icon: Hash,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("status", "Status", {
    icon: CheckCircle2,
    sortingFn: "string",
    cell: ({ getValue }) => <StatusBadge status={getValue() as LoanStatus | undefined} />,
  }),
  sortableColumn<ScheduleRow>("source", "Source", {
    icon: FileText,
    cell: ({ getValue }) => (getValue() as string) || "—",
  }),
  sortableColumn<ScheduleRow>("loanAmount", "Loan Amount", {
    icon: Banknote,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(v) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("upb", "UPB", {
    icon: Banknote,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(v) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("rate", "Interest Rate", {
    icon: Percent,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? v.toFixed(3) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("firstPaymentDate", "First Payment", {
    icon: Calendar,
    cell: ({ getValue }) => (getValue() as string) ?? "—",
    sortingFn: "date",
  }),
  sortableColumn<ScheduleRow>("purpose", "Purpose", {
    icon: Target,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("fico", "FICO", {
    icon: CreditCard,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? String(v) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("ltv", "LTV", {
    icon: Scale,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? `${v.toFixed(2)}%` : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("cltv", "CLTV", {
    icon: Scale,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? `${v.toFixed(2)}%` : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("dti", "DTI", {
    icon: Percent,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? `${v.toFixed(2)}%` : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("occupancy", "Occupancy", {
    icon: Home,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("propertyAddress", "Property Address", {
    icon: MapPin,
    cell: ({ getValue }) => (getValue() as string) || "—",
  }),
  sortableColumn<ScheduleRow>("city", "City", {
    icon: MapPin,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("county", "County", {
    icon: MapPin,
    cell: ({ getValue }) => (getValue() as string) || "—",
  }),
  sortableColumn<ScheduleRow>("state", "State", {
    icon: MapPin,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("propertyType", "Property Type", {
    icon: Building,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("units", "Units", {
    icon: Hash,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? String(v) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("productType", "Product Type", {
    icon: Package,
    sortingFn: "string",
    cell: ({ getValue }) => (getValue() as string) ?? "—",
  }),
  sortableColumn<ScheduleRow>("term", "Term", {
    icon: Clock,
    cell: ({ getValue }) => {
      const v = getValue() as number | undefined;
      return v != null ? String(v) : "—";
    },
    sortingFn: "numeric",
  }),
  sortableColumn<ScheduleRow>("lienPosition", "Lien Position", {
    icon: FileText,
    cell: ({ getValue }) => (getValue() as string) || "—",
  }),
];

export default function Step7Schedule() {
  const [rows, setRows] = useState<ScheduleRow[]>(step7ScheduleRows);
  const [drilldown, setDrilldown] = useState<{
    type: DrilldownType;
    id: string | null;
    data: KpiDrilldown | ScheduleRow | null;
  } | null>(null);

  const handleImport = useCallback((imported: LoanRecord[]) => {
    const scheduleRows = imported.map(loanToScheduleRow);
    setRows((prev) => [...scheduleRows, ...prev]);
  }, []);

  const exportCSV = useCallback((data: ScheduleRow[]) => exportScheduleToCSV(data), []);
  const exportExcel = useCallback((data: ScheduleRow[]) => exportScheduleToExcel(data), []);

  const handleKpiClick = (item: KpiItem) => {
    const id = item.id ?? null;
    if (!id) return;
    const data = step7KpiDrilldown[id];
    if (data) {
      setDrilldown((prev) =>
        prev?.type === "kpi" && prev.id === id ? null : { type: "kpi", id, data }
      );
    }
  };

  const handleRowClick = (row: ScheduleRow) => {
    setDrilldown((prev) =>
      prev?.type === "loan" && prev.id === row.tvm ? null : { type: "loan", id: row.tvm, data: row }
    );
  };

  const closeDrilldown = () => setDrilldown(null);

  return (
    <SprinkleShell
      stepId="7"
      kpis={STEP7_KPIS}
      animateKpis
      onKpiClick={(item) => item.id && handleKpiClick(item)}
    >
      <PanelCard
        data-tour="schedule-table"
        className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
        icon={List}
        title="Loan Detail"
        subtitle="Schedule of Selected Loans • Click a row for full loan details • Click KPIs above for definitions"
        right={
          <div className="flex items-center gap-2">
            <ImportButton onImport={handleImport} />
            <ExportButton
              data={rows}
              filename="loan_schedule"
              exportCSV={exportCSV}
              exportExcel={exportExcel}
            />
          </div>
        }
      >
        <DataTable
          data={rows}
          columns={columns}
          height={620}
          animateRows
          stripeRows
          onRowClick={handleRowClick}
        />
      </PanelCard>

      {drilldown?.data && (
        <div className="mt-4">
          <DrilldownPanel
            title={
              drilldown.type === "kpi"
                ? `Drilldown: ${(drilldown.data as KpiDrilldown).label}`
                : `Loan Detail: ${(drilldown.data as ScheduleRow).tvm}`
            }
            data={drilldown.data}
            onClose={closeDrilldown}
            type={drilldown.type ?? "kpi"}
          />
        </div>
      )}

      <footer data-tour="schedule-cashflow" className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>
      <div data-tour="schedule-maturity" className="hidden" />
    </SprinkleShell>
  );
}
