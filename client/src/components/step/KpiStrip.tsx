import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Tooltip } from "@/components/ui/Tooltip";

export type KpiItem = {
  label: string;
  value: string;
  helper?: string;
  tooltip?: string;
  icon?: LucideIcon;
  id?: string;
};

const KPI_CARD_COLORS = [
  { icon: "bg-blue-500/20 text-blue-600", label: "text-blue-700/90" },
  { icon: "bg-indigo-500/20 text-indigo-600", label: "text-indigo-700/90" },
  { icon: "bg-cyan-500/20 text-cyan-600", label: "text-cyan-700/90" },
  { icon: "bg-teal-500/20 text-teal-600", label: "text-teal-700/90" },
  { icon: "bg-violet-500/20 text-violet-600", label: "text-violet-700/90" },
  { icon: "bg-fuchsia-500/20 text-fuchsia-600", label: "text-fuchsia-700/90" },
];

function isNumericValue(v: string): boolean {
  return /^[\d,.\-]+$/.test(v.trim());
}

export function KpiStrip({
  items,
  animate = false,
  onItemClick,
  compact = false,
  className,
}: {
  items: KpiItem[];
  animate?: boolean;
  onItemClick?: (item: KpiItem, index: number) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-white/50 bg-white/20 backdrop-blur-sm py-3 sm:py-4", className)}>
      <div className="container-page">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6 lg:gap-4">
          {items.map((kpi, idx) => {
            const colors = KPI_CARD_COLORS[idx % KPI_CARD_COLORS.length];
            const tooltipContent = kpi.tooltip ?? kpi.helper ?? (onItemClick ? "Click for details" : kpi.label);
            const card = (
              <div
                key={kpi.label}
                role={onItemClick ? "button" : undefined}
                tabIndex={onItemClick ? 0 : undefined}
                onClick={onItemClick ? () => onItemClick(kpi, idx) : undefined}
                onKeyDown={onItemClick ? (e) => e.key === "Enter" && onItemClick(kpi, idx) : undefined}
                className={cn(
                  "sx-surface sx-hover-brighten flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl",
                  onItemClick && "cursor-pointer"
                )}
              >
                <div className="flex flex-1 flex-col justify-center min-w-0 px-2.5 py-2 sm:px-3.5 sm:py-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {kpi.icon && (
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-md h-4 w-4 sm:h-5 sm:w-5",
                          colors.icon
                        )}
                      >
                        <kpi.icon className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={2} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "font-medium uppercase min-w-0 truncate text-[9px] sm:text-[11px] tracking-[0.04em] sm:tracking-[0.1em]",
                        colors.label
                      )}
                    >
                      {kpi.label}
                    </div>
                  </div>
                  <div className="mt-0.5 sm:mt-1 font-semibold tracking-tight tabular-nums text-slate-800 [font-family:var(--font-display)] truncate text-[13px] sm:text-lg lg:text-[22px]">
                    {animate && isNumericValue(kpi.value) ? (
                      <AnimatedCounter
                        value={kpi.value}
                        duration={900}
                        decimals={kpi.value.includes(".") ? 2 : 0}
                      />
                    ) : (
                      kpi.value
                    )}
                  </div>
                  {kpi.helper && !compact && (
                    <div className={cn("mt-0.5 text-[10px] sm:text-xs opacity-80 truncate", colors.label)}>
                      {kpi.helper}
                    </div>
                  )}
                </div>
              </div>
            );
            return (
              <Tooltip key={kpi.label} content={tooltipContent} wrapperClassName="w-full min-w-0 overflow-hidden">
                {card}
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
