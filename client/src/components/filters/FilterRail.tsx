import { useState, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export type FilterGroup = {
  title: string;
  options: string[];
  section?: string;
};

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
          ? "bg-sky-600 text-white"
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
    <div className="border-b border-white/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white/30"
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
    <div className="border-b border-white/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white/30"
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

function FilterBody({
  groups,
  selected,
  onFilterChange,
  onClearAll,
}: {
  groups: FilterGroup[];
  selected: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearAll?: () => void;
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
  const activeCount = Object.values(selected).flat().length;

  return (
    <div className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(56,189,248,0.07)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-slate-800">Filters</span>
          {hasFilters && (
            <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
              {activeCount}
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
      {onFilterChange && (
        <div className="border-b border-white/40 px-3 py-1.5">
          <p className="text-[11px] text-slate-500">Click charts or filters to drill down</p>
        </div>
      )}
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
  );
}

export function FilterRail({
  groups,
  selected = {},
  onFilterChange,
  onClearAll,
  mobileOpen = false,
  onMobileClose,
  className,
}: {
  groups: FilterGroup[];
  selected?: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearAll?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}) {
  const activeCount = Object.values(selected).flat().length;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:block w-full", className)}>
        <div className="sticky top-[72px]">
          <FilterBody
            groups={groups}
            selected={selected}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[1101] max-h-[82vh] overflow-hidden rounded-t-2xl bg-white shadow-2xl lg:hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-sky-600" strokeWidth={2} />
                <span className="text-sm font-semibold text-slate-800">Filters</span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && onClearAll && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 pb-safe">
              <FilterBody
                groups={groups}
                selected={selected}
                onFilterChange={onFilterChange}
                onClearAll={onClearAll}
              />
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={onMobileClose}
                className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 active:bg-sky-800"
              >
                Show results
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
