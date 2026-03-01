import { useState, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterGroup = {
  title: string;
  options: string[];
  /** Section header (e.g. "Product", "Credit") */
  section?: string;
};

/** Selected filters: group title -> array of selected option values */
export type FilterState = Record<string, string[]>;

function FilterChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        checked
          ? "bg-slate-800 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
      )}
    >
      {label}
    </button>
  );
}

function FilterSection({
  title,
  groups,
  selected,
  onFilterChange,
  defaultOpen = true,
}: {
  title: string;
  groups: FilterGroup[];
  selected: FilterState;
  onFilterChange: (group: string, value: string, checked: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50/50"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{title}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="space-y-4 px-3 pb-3">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="mb-1.5 text-[11px] font-medium text-slate-500">{g.title}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.options.map((opt) => {
                  const checked = (selected[g.title] ?? []).includes(opt);
                  return (
                    <FilterChip
                      key={opt}
                      label={opt}
                      checked={checked}
                      onChange={() => onFilterChange?.(g.title, opt, !checked)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StateFilterSection({
  options,
  selected,
  onFilterChange,
}: {
  options: string[];
  selected: string[];
  onFilterChange: (value: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50/50"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">State</span>
        {selected.length > 0 && (
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            {selected.length}
          </span>
        )}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="space-y-2 px-3 pb-3">
          <input
            type="text"
            placeholder="Search states..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
            {filtered.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <FilterChip
                  key={opt}
                  label={opt}
                  checked={checked}
                  onChange={() => onFilterChange(opt, !checked)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterRail({
  groups,
  selected = {},
  onFilterChange,
  onClearAll,
  className,
}: {
  groups: FilterGroup[];
  selected?: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearAll?: () => void;
  className?: string;
}) {
  const hasFilters = Object.keys(selected).length > 0;
  const bySection = useMemo(() => {
    const acc: Record<string, FilterGroup[]> = {};
    for (const g of groups) {
      const s = g.section ?? "Filters";
      if (!acc[s]) acc[s] = [];
      acc[s].push(g);
    }
    return acc;
  }, [groups]);

  const stateGroup = groups.find((g) => g.title === "State");
  const productGroups = (bySection["Product"] ?? []).filter((g) => g.title !== "State");
  const creditGroups = bySection["Credit"] ?? [];

  return (
    <aside className={cn("w-full", className)}>
      <div className="sticky top-4 rounded-lg border border-slate-200/80 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
            <span className="text-sm font-medium text-slate-800">Filters</span>
            {hasFilters && (
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {Object.values(selected).flat().length}
              </span>
            )}
          </div>
          {hasFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Subtitle */}
        {onFilterChange && (
          <div className="border-b border-slate-100 px-3 py-1.5">
            <p className="text-[11px] text-slate-500">Click charts or filters to drill down</p>
          </div>
        )}

        {/* Sections */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {productGroups.length > 0 && (
            <FilterSection
              title="Product"
              groups={productGroups}
              selected={selected}
              onFilterChange={onFilterChange ?? (() => {})}
              defaultOpen
            />
          )}
          {stateGroup && (
            <StateFilterSection
              options={stateGroup.options}
              selected={selected["State"] ?? []}
              onFilterChange={(value, checked) => onFilterChange?.("State", value, checked)}
            />
          )}
          {creditGroups.length > 0 && (
            <FilterSection
              title="Credit"
              groups={creditGroups}
              selected={selected}
              onFilterChange={onFilterChange ?? (() => {})}
              defaultOpen={false}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
