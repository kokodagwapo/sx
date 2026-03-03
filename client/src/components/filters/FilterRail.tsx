import { useState, useMemo, useCallback, useRef } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, X, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
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
  /** Unique key — used as the key in sliderState */
  field: string;
  /** Display label shown above the slider */
  label: string;
  min: number;
  max: number;
  step: number;
  /** Format a raw number for display (e.g. "$350,000" or "3.75%") */
  format: (v: number) => string;
  /** Optional unit shown beside the value */
  unit?: string;
};

export type SliderState = Record<string, [number, number]>;

export type FilterState = Record<string, string[]>;

// ─── Dual-handle range slider ────────────────────────────────────────────────

function RangeSlider({
  min,
  max,
  step,
  value,
  format,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  format: (v: number) => string;
  onChange: (v: [number, number]) => void;
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
    },
    [hi, step, onChange],
  );

  const handleHi = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), lo + step);
      onChange([lo, v]);
    },
    [lo, step, onChange],
  );

  return (
    <div className="select-none">
      {/* Value display */}
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[11px] font-semibold text-sky-700 tabular-nums">
          {format(lo)}
        </span>
        <span className="text-[10px] text-slate-400">to</span>
        <span className="rounded-md bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[11px] font-semibold text-sky-700 tabular-nums">
          {format(hi)}
        </span>
      </div>

      {/* Track + thumbs */}
      <div className="relative h-5 flex items-center">
        {/* Base track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full bg-sky-400"
          style={{ left: `${loPercent}%`, right: `${100 - hiPercent}%` }}
        />
        {/* Lo thumb */}
        <input
          ref={loRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-500 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: lo > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Hi thumb */}
        <input
          ref={hiRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-sky-500 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min/max hints */}
      <div className="mt-1 flex justify-between">
        <span className="text-[9px] text-slate-400">{format(min)}</span>
        <span className="text-[9px] text-slate-400">{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Slider section (collapsible) ────────────────────────────────────────────

function SliderSection({
  sliders,
  sliderState,
  onSliderChange,
  defaultOpen = true,
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
    <div className="border-b border-white/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Range Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">{activeCount}</span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="space-y-4 px-3 pb-4">
          {sliders.map((s) => {
            const current = sliderState[s.field] ?? [s.min, s.max];
            const isActive = current[0] !== s.min || current[1] !== s.max;
            return (
              <div key={s.field}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn("text-[11px] font-semibold", isActive ? "text-sky-700" : "text-slate-600")}>
                    {s.label}
                  </span>
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => onSliderChange(s.field, [s.min, s.max])}
                      className="flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-2.5 w-2.5" />
                      Reset
                    </button>
                  )}
                </div>
                <RangeSlider
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={current}
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

// ─── Chip-based filter ────────────────────────────────────────────────────────

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

// ─── FilterBody ───────────────────────────────────────────────────────────────

// ─── Live rate ticker (embedded in filter rail) ───────────────────────────────
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
        className="w-full text-left px-3 py-2.5 border-b border-white/40 bg-gradient-to-r from-sky-50/60 to-indigo-50/40 hover:from-sky-100/60 hover:to-indigo-100/40 transition-colors group"
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
        <div className="mt-1.5 text-[9px] text-sky-600 font-medium group-hover:underline">
          See all rates →
        </div>
      </button>
      {modalOpen && data && <RateModal data={data} onClose={() => setModalOpen(false)} />}
    </>
  );
}

function FilterBody({
  groups,
  selected,
  onFilterChange,
  onClearAll,
  sliders,
  sliderState,
  onSliderChange,
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

  return (
    <div className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(56,189,248,0.07)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-slate-800">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
              {activeCount}
            </span>
          )}
        </div>
        {(hasFilters || hasSliderFilters) && onClearAll && (
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
      <MortgageRatesMini />
      {onFilterChange && (
        <div className="border-b border-white/40 px-3 py-1.5">
          <p className="text-[11px] text-slate-500">Click charts or filters to narrow results</p>
        </div>
      )}
      <div>
        {/* Range sliders first — most banker-friendly */}
        {sliders && sliders.length > 0 && sliderState && onSliderChange && (
          <SliderSection
            sliders={sliders}
            sliderState={sliderState}
            onSliderChange={onSliderChange}
            defaultOpen
          />
        )}
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

// ─── Public FilterRail ────────────────────────────────────────────────────────

export function FilterRail({
  groups,
  selected = {},
  onFilterChange,
  onClearAll,
  mobileOpen = false,
  onMobileClose,
  className,
  sliders,
  sliderState,
  onSliderChange,
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
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:block w-full", className)}>
        <div className="sticky top-[72px]">
          <FilterBody
            groups={groups}
            selected={selected}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            sliders={sliders}
            sliderState={sliderState}
            onSliderChange={onSliderChange}
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
                sliders={sliders}
                sliderState={sliderState}
                onSliderChange={onSliderChange}
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
