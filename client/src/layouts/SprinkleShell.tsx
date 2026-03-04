import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { KpiStrip, type KpiItem } from "@/components/step/KpiStrip";
import { type StepId, steps } from "@/app/steps";
import { FilterRail, type FilterGroup, type FilterState, type SliderGroup, type SliderState } from "@/components/filters/FilterRail";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

export function SprinkleShell({
  stepId,
  title,
  kpis,
  filters,
  filterState,
  onFilterChange,
  onClearFilters,
  animateKpis = false,
  onKpiClick,
  kpiCompact = false,
  children,
  className,
  sliders,
  sliderState,
  onSliderChange,
}: {
  stepId: StepId;
  title?: string;
  kpis: KpiItem[];
  filters?: FilterGroup[];
  filterState?: FilterState;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onClearFilters?: () => void;
  animateKpis?: boolean;
  onKpiClick?: (item: KpiItem, index: number) => void;
  kpiCompact?: boolean;
  children: ReactNode;
  className?: string;
  sliders?: SliderGroup[];
  sliderState?: SliderState;
  onSliderChange?: (field: string, range: [number, number]) => void;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("sprinklex_sidebar") !== "open"; } catch { return true; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const location = useLocation();
  const step = steps.find((s) => s.id === stepId);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileFilterOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(c => {
      const next = !c;
      try { localStorage.setItem("sprinklex_sidebar", next ? "closed" : "open"); } catch {}
      return next;
    });
  };

  const hasFilters = (filters?.length ?? 0) > 0 || (sliders?.length ?? 0) > 0;

  return (
    <div className={cn("min-h-screen transition-colors duration-300", className)} style={{ background: "hsl(var(--app-bg))" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[220px]"
        )}
      >
        <TopNav
          title={title ?? step?.headerTitle ?? `Step ${stepId}`}
          onMenuClick={() => setMobileMenuOpen((o) => !o)}
        />

        <KpiStrip items={kpis} animate={animateKpis} onItemClick={onKpiClick} compact={kpiCompact} />

        <div className="">
          <div className="container-page py-5">
            <div
              className={cn(
                "grid gap-4",
                hasFilters ? "lg:grid-cols-[240px_1fr]" : "grid-cols-1",
              )}
            >
              {hasFilters ? (
                <div data-tour="filter-rail">
                  <FilterRail
                    groups={filters ?? []}
                    selected={filterState}
                    onFilterChange={onFilterChange}
                    onClearAll={onClearFilters}
                    sliders={sliders}
                    sliderState={sliderState}
                    onSliderChange={onSliderChange}
                    mobileOpen={mobileFilterOpen}
                    onMobileClose={() => setMobileFilterOpen(false)}
                  />
                </div>
              ) : null}
              <main className="min-w-0">{children}</main>
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="fixed bottom-5 right-5 z-[900] lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-700 active:scale-95"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
              <span>Filters</span>
              {Object.values(filterState ?? {}).flat().length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-sky-600">
                  {Object.values(filterState ?? {}).flat().length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[999] bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-[1001] h-full w-[220px] lg:hidden">
            <Sidebar
              forceShow
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
