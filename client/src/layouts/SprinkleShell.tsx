import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { KpiStrip, type KpiItem } from "@/components/step/KpiStrip";
import { type StepId, steps } from "@/app/steps";
import { FilterRail, type FilterGroup, type FilterState } from "@/components/filters/FilterRail";
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
  /** Compact single-row KPI layout with abbreviated labels */
  kpiCompact?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const step = steps.find((s) => s.id === stepId);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen bg-[#eef6ff] transition-colors duration-300", className)}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content area - offset by sidebar width on desktop */}
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
                filters?.length ? "lg:grid-cols-[240px_1fr]" : "grid-cols-1",
              )}
            >
              {filters?.length ? (
                <FilterRail
                  groups={filters}
                  selected={filterState}
                  onFilterChange={onFilterChange}
                  onClearAll={onClearFilters}
                />
              ) : null}
              <main className="min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay when menu open */}
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
