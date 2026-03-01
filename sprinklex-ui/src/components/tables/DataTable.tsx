import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export function SortableHeader<T>({
  column,
  icon: Icon,
  label,
}: {
  column: Column<T, unknown>;
  icon?: LucideIcon;
  label: string;
}) {
  const canSort = column.getCanSort();
  const sortDir = column.getIsSorted();
  const tooltipContent = canSort ? `Sort by ${label}` : label;

  const button = (
    <button
      type="button"
      onClick={canSort ? () => column.toggleSorting(undefined, true) : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 text-left transition-colors",
        canSort && "cursor-pointer hover:text-slate-900",
        !canSort && "cursor-default"
      )}
    >
      {Icon && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#4285F4]/10 text-[#4285F4]">
          <Icon className="h-2.5 w-2.5" strokeWidth={2} />
        </div>
      )}
      <span>{label}</span>
      {canSort && (
        <span className="ml-0.5 shrink-0 text-slate-400">
          {sortDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : sortDir === "desc" ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      )}
    </button>
  );

  return <Tooltip content={tooltipContent}>{button}</Tooltip>;
}

/** Numeric sort: undefined/null at end */
export function numericSortFn(rowA: { getValue: (id: string) => unknown }, rowB: { getValue: (id: string) => unknown }, columnId: string) {
  const a = rowA.getValue(columnId) as number | undefined | null;
  const b = rowB.getValue(columnId) as number | undefined | null;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

/** String sort: undefined/null at end */
export function stringSortFn(rowA: { getValue: (id: string) => unknown }, rowB: { getValue: (id: string) => unknown }, columnId: string) {
  const a = String(rowA.getValue(columnId) ?? "");
  const b = String(rowB.getValue(columnId) ?? "");
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

/** Date sort: undefined/null at end */
export function dateSortFn(rowA: { getValue: (id: string) => unknown }, rowB: { getValue: (id: string) => unknown }, columnId: string) {
  const a = rowA.getValue(columnId) as string | undefined | null;
  const b = rowB.getValue(columnId) as string | undefined | null;
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

/** Helper to create a sortable column with optional icon */
export function sortableColumn<T>(
  accessorKey: keyof T & string,
  label: string,
  options?: {
    icon?: LucideIcon;
    cell?: (info: { getValue: () => unknown }) => React.ReactNode;
    sortingFn?: "numeric" | "string" | "date" | "basic";
  }
): ColumnDef<T, unknown> {
  const { icon, cell, sortingFn } = options ?? {};
  const fn = sortingFn === "numeric" ? numericSortFn : sortingFn === "date" ? dateSortFn : sortingFn === "string" ? stringSortFn : undefined;
  return {
    accessorKey,
    header: ({ column }) => (
      <SortableHeader column={column} icon={icon} label={label} />
    ),
    cell: cell
      ? ({ getValue }) => cell({ getValue })
      : undefined,
    enableSorting: true,
    sortingFn: fn,
  };
}

export function DataTable<T>({
  data,
  columns,
  height = 520,
  animateRows = false,
  onRowClick,
  stripeRows = false,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  height?: number;
  animateRows?: boolean;
  onRowClick?: (row: T) => void;
  stripeRows?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className="overflow-auto rounded-xl border border-slate-200/70 bg-white"
      style={{ height }}
    >
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap border-b border-slate-200/70 px-3 py-2 text-left text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-600"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row.original) : undefined}
              className={cn(
                "hover:bg-slate-50/60 transition-colors",
                animateRows && "opacity-0 animate-fade-in-up",
                onRowClick && "cursor-pointer",
                stripeRows && idx % 2 === 1 && "bg-slate-50/40"
              )}
              style={animateRows ? { animationDelay: `${Math.min(idx * 15, 400)}ms` } : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap border-b border-slate-200/50 px-3 py-2 text-slate-700"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
