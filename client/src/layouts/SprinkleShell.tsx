import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { KpiStrip, type KpiItem } from "@/components/step/KpiStrip";
import { type StepId, steps } from "@/app/steps";
import { FilterRail, type FilterGroup, type FilterState, type SliderGroup, type SliderState } from "@/components/filters/FilterRail";
import { cn } from "@/lib/utils";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const step = steps.find((s) => s.id === stepId);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (stepId !== "1") return;
    setSidebarCollapsed(false);
    const t = setTimeout(() => setSidebarCollapsed(true), 3500);
    return () => clearTimeout(t);
  }, [stepId]);

  const hasFilters = (filters?.length ?? 0) > 0 || (sliders?.length ?? 0) > 0;

  return (
    <div className={cn("min-h-screen bg-[#e8f2ff] transition-colors duration-300", className)}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
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
                  />
                </div>
              ) : null}
              <main className="min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[999] bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-[1001] h-full w-[260px] lg:hidden">
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
