import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, X, TrendingUp, TrendingDown, Minus, ExternalLink, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { RateModal, type RatesData } from "@/components/rates/RateModal";

export type FilterGroup = {
  title: string;
  options: string[];
  section?: string;
};

export type SliderGroup = {
  field: string;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  unit?: string;
};

export type SliderState = Record<string, [number, number]>;
export type FilterState = Record<string, string[]>;

// ─── Dual-handle range slider ─────────────────────────────────────────────────

function RangeSlider({
  min, max, step, value, format, onChange,
}: {
  min: number; max: number; step: number; value: [number, number];
  format: (v: number) => string; onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const range = max - min;
  const loRef = useRef<HTMLInputElement>(null);
  const hiRef = useRef<HTMLInputElement>(null);
  const loPercent = range > 0 ? ((lo - min) / range) * 100 : 0;
  const hiPercent = range > 0 ? ((hi - min) / range) * 100 : 100;

  const handleLo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), hi - step);
      onChange([v, hi]);
    }, [hi, step, onChange],
  );

  const handleHi = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), lo + step);
      onChange([lo, v]);
    }, [lo, step, onChange],
  );

  return (
    <div className="select-none">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="flex-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-center text-[11px] font-semibold text-sky-700 tabular-nums shadow-inner">
          {format(lo)}
        </span>
        <span className="text-[10px] font-medium text-slate-400">—</span>
        <span className="flex-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-center text-[11px] font-semibold text-sky-700 tabular-nums shadow-inner">
          {format(hi)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
        <div
          className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 shadow-sm"
          style={{ left: `${loPercent}%`, right: `${100 - hiPercent}%` }}
        />
        <input
          ref={loRef}
          type="range" min={min} max={max} step={step} value={lo} onChange={handleLo}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-500 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: lo > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        <input
          ref={hiRef}
          type="range" min={min} max={max} step={step} value={hi} onChange={handleHi}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-500 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="mt-1 flex justify-between">
        <span className="text-[9px] font-medium text-slate-400">{format(min)}</span>
        <span className="text-[9px] font-medium text-slate-400">{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Slider section ───────────────────────────────────────────────────────────

function SliderSection({
  sliders, sliderState, onSliderChange, defaultOpen = true,
}: {
  sliders: SliderGroup[];
  sliderState: SliderState;
  onSliderChange: (field: string, range: [number, number]) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const activeCount = sliders.filter((s) => {
    const v = sliderState[s.field];
    return v && (v[0] !== s.min || v[1] !== s.max);
  }).length;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100">
            <SlidersHorizontal className="h-3 w-3 text-violet-600" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Range Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">{activeCount}</span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        }
      </button>
      {open && (
        <div className="space-y-5 px-3 pb-4">
          {sliders.map((s) => {
            const current = sliderState[s.field] ?? [s.min, s.max];
            const isActive = current[0] !== s.min || current[1] !== s.max;
            return (
              <div key={s.field}>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-violet-500" : "bg-slate-300")} />
                    <span className={cn("text-[11px] font-semibold", isActive ? "text-violet-700" : "text-slate-600")}>
                      {s.label}
                    </span>
                  </div>
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => onSliderChange(s.field, [s.min, s.max])}
                      className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" /> Reset
                    </button>
                  )}
                </div>
                <RangeSlider
                  min={s.min} max={s.max} step={s.step} value={current}
                  format={s.format}
                  onChange={(v) => onSliderChange(s.field, v)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "inline-flex w-full items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium leading-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1",
        checked
          ? "border-sky-500 bg-sky-600 text-white shadow-sm shadow-sky-200"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
      )}
    >
      {checked && <Check className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.5} />}
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── State chip (compact square style) ───────────────────────────────────────

function StateChip({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-1 text-[10px] font-semibold leading-none transition-all duration-150",
        checked
          ? "border-sky-500 bg-sky-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
      )}
    >
      {label}
    </button>
  );
}

// ─── Filter section (collapsible, with group headers) ─────────────────────────

const SECTION_COLORS: Record<string, { dot: string; icon: string; badge: string; badgeText: string }> = {
  Product:  { dot: "bg-emerald-500",  icon: "bg-emerald-100", badge: "bg-emerald-100", badgeText: "text-emerald-700" },
  Credit:   { dot: "bg-sky-500",      icon: "bg-sky-100",     badge: "bg-sky-100",     badgeText: "text-sky-700"     },
  Filters:  { dot: "bg-amber-500",    icon: "bg-amber-100",   badge: "bg-amber-100",   badgeText: "text-amber-700"   },
};

function FilterSection({
  title, groups, selected, onFilterChange, defaultOpen = true,
}: {
  title: string;
  groups: FilterGroup[];
  selected: FilterState;
  onFilterChange: (group: string, value: string, checked: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = SECTION_COLORS[title] ?? SECTION_COLORS.Filters;
  const activeCount = groups.reduce((n, g) => n + (selected[g.title]?.length ?? 0), 0);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{title}</span>
          {activeCount > 0 && (
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", colors.badge, colors.badgeText)}>
              {activeCount}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        }
      </button>

      {open && (
        <div className="space-y-4 px-3 pb-4">
          {groups.map((g) => {
            const groupSelected = selected[g.title] ?? [];
            const hasSelection = groupSelected.length > 0;
            return (
              <div key={g.title}>
                {/* Group label row */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-0.5 rounded-full bg-slate-300" />
                    <span className={cn("text-[11px] font-semibold", hasSelection ? "text-sky-700" : "text-slate-500")}>
                      {g.title}
                    </span>
                    {hasSelection && (
                      <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                        {groupSelected.length}
                      </span>
                    )}
                  </div>
                  {hasSelection && (
                    <button
                      type="button"
                      onClick={() => groupSelected.forEach((v) => onFilterChange(g.title, v, false))}
                      className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" /> Clear
                    </button>
                  )}
                </div>

                {/* Chips in 2-column grid */}
                <div className={cn(
                  "grid gap-1.5",
                  g.options.length <= 3 ? "grid-cols-3" :
                  g.options.length === 4 ? "grid-cols-2" :
                  "grid-cols-2"
                )}>
                  {g.options.map((opt) => {
                    const checked = groupSelected.includes(opt);
                    return (
                      <FilterChip
                        key={opt}
                        label={opt}
                        checked={checked}
                        onChange={() => onFilterChange(g.title, opt, !checked)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── State filter section ─────────────────────────────────────────────────────

function StateFilterSection({
  options, selected, onFilterChange, defaultOpen = false,
}: {
  options: string[];
  selected: string[];
  onFilterChange: (value: string, checked: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">State</span>
          {selected.length > 0 && (
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
              {selected.length}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        }
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search states..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-[11px] placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300/50 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Selected chips shown first */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onFilterChange(s, false)}
                  className="inline-flex items-center gap-0.5 rounded-md border border-sky-400 bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
                >
                  {s} <X className="h-2.5 w-2.5 opacity-80" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => selected.forEach((s) => onFilterChange(s, false))}
                className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* All state chips in a grid */}
          <div className="grid grid-cols-3 gap-1 max-h-[160px] overflow-y-auto pr-0.5">
            {filtered.filter((o) => !selected.includes(o)).map((opt) => (
              <StateChip
                key={opt}
                label={opt}
                checked={false}
                onChange={() => onFilterChange(opt, true)}
              />
            ))}
          </div>
          {filtered.filter((o) => !selected.includes(o)).length === 0 && (
            <p className="text-center text-[10px] text-slate-400 py-1">No states match</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Live rate ticker ─────────────────────────────────────────────────────────

function RateTick({ label, rate, prev }: { label: string; rate?: number; prev?: number }) {
  if (rate == null) return null;
  const diff = prev != null ? parseFloat((rate - prev).toFixed(3)) : 0;
  const up = diff > 0;
  const dn = diff < 0;
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold tabular-nums text-slate-800">{rate.toFixed(2)}%</span>
        <span className={cn(
          "text-[10px] font-semibold tabular-nums flex items-center gap-0.5",
          up ? "text-emerald-600" : dn ? "text-red-500" : "text-slate-400",
        )}>
          {up ? <TrendingUp className="h-2.5 w-2.5" /> : dn ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
          {up ? "+" : ""}{diff.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function MortgageRatesMini() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery<RatesData>({
    queryKey: ["/api/rates"],
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full text-left px-3 py-2.5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100/80 hover:to-indigo-100/80 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Live Market Rates</span>
          <ExternalLink className="h-3 w-3 text-sky-400 group-hover:text-sky-600 transition-colors" />
        </div>
        {isLoading ? (
          <div className="flex gap-4">
            {["w-12", "w-10"].map((w) => (
              <div key={w} className={`h-5 ${w} rounded bg-slate-200/70 animate-pulse`} />
            ))}
          </div>
        ) : !data ? (
          <div className="text-[10px] text-slate-400">Unable to load rates</div>
        ) : (
          <div className="flex gap-4">
            <RateTick label="30-YR CONV" rate={data.mortgage30.rate} prev={data.mortgage30.prev} />
            <RateTick label="10-YR TSY"  rate={data.treasury10.rate} prev={data.treasury10.prev} />
          </div>
        )}
        <div className="mt-1 text-[9px] text-sky-600 font-medium group-hover:underline">See all rates →</div>
      </button>
      {modalOpen && data && <RateModal data={data} onClose={() => setModalOpen(false)} />}
    </>
  );
}

// ─── Filter body ──────────────────────────────────────────────────────────────

function FilterBody({
  groups, selected, onFilterChange, onClearAll, sliders, sliderState, onSliderChange,
}: {
  groups: FilterGroup[];
  selected: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearAll?: () => void;
  sliders?: SliderGroup[];
  sliderState?: SliderState;
  onSliderChange?: (field: string, range: [number, number]) => void;
}) {
  const hasFilters = Object.keys(selected).length > 0;
  const hasSliderFilters = sliders?.some((s) => {
    const v = sliderState?.[s.field];
    return v && (v[0] !== s.min || v[1] !== s.max);
  });

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

  const activeChipCount = Object.values(selected).flat().length;
  const activeSliderCount = sliders?.filter((s) => {
    const v = sliderState?.[s.field];
    return v && (v[0] !== s.min || v[1] !== s.max);
  }).length ?? 0;
  const activeCount = activeChipCount + activeSliderCount;

  const [autoExpanded, setAutoExpanded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAutoExpanded(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100">
            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-slate-800">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {activeCount}
            </span>
          )}
        </div>
        {(hasFilters || hasSliderFilters) && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors shadow-sm"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Market rates */}
      <MortgageRatesMini />

      {/* Helper text */}
      {onFilterChange && (
        <div className="border-b border-slate-100 bg-slate-50/50 px-3 py-1.5">
          <p className="text-[10px] text-slate-400">Click any filter to narrow results</p>
        </div>
      )}

      <div key={autoExpanded ? "expanded" : "collapsed"}>
        {/* Range sliders */}
        {sliders && sliders.length > 0 && sliderState && onSliderChange && (
          <SliderSection
            sliders={sliders}
            sliderState={sliderState}
            onSliderChange={onSliderChange}
            defaultOpen={autoExpanded}
          />
        )}

        {/* Product filters */}
        {productGroups.length > 0 && (
          <FilterSection
            title="Product"
            groups={productGroups}
            selected={selected}
            onFilterChange={onFilterChange ?? (() => {})}
            defaultOpen={autoExpanded}
          />
        )}

        {/* State filter */}
        {stateGroup && (
          <StateFilterSection
            options={stateGroup.options}
            selected={selected["State"] ?? []}
            onFilterChange={(value, checked) => onFilterChange?.("State", value, checked)}
            defaultOpen={autoExpanded}
          />
        )}

        {/* Credit filters (LTV, FICO, etc.) */}
        {creditGroups.length > 0 && (
          <FilterSection
            title="Credit"
            groups={creditGroups}
            selected={selected}
            onFilterChange={onFilterChange ?? (() => {})}
            defaultOpen={autoExpanded}
          />
        )}
      </div>
    </div>
  );
}

// ─── Public FilterRail ────────────────────────────────────────────────────────

export function FilterRail({
  groups, selected = {}, onFilterChange, onClearAll,
  mobileOpen = false, onMobileClose, className,
  sliders, sliderState, onSliderChange,
}: {
  groups: FilterGroup[];
  selected?: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearAll?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
  sliders?: SliderGroup[];
  sliderState?: SliderState;
  onSliderChange?: (field: string, range: [number, number]) => void;
}) {
  const activeChipCount = Object.values(selected).flat().length;
  const activeSliderCount = sliders?.filter((s) => {
    const v = sliderState?.[s.field];
    return v && (v[0] !== s.min || v[1] !== s.max);
  }).length ?? 0;
  const activeCount = activeChipCount + activeSliderCount;

  return (
    <>
      {/* Desktop */}
      <aside className={cn("hidden lg:block w-full", className)}>
        <div className="sticky top-[72px]">
          <FilterBody
            groups={groups} selected={selected}
            onFilterChange={onFilterChange} onClearAll={onClearAll}
            sliders={sliders} sliderState={sliderState} onSliderChange={onSliderChange}
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
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && onClearAll && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 pb-safe">
              <FilterBody
                groups={groups} selected={selected}
                onFilterChange={onFilterChange} onClearAll={onClearAll}
                sliders={sliders} sliderState={sliderState} onSliderChange={onSliderChange}
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
