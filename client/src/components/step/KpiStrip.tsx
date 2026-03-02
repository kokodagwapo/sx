import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Tooltip } from "@/components/ui/Tooltip";

export type KpiItem = {
  label: string;
  value: string;
  helper?: string;
  /** Full title for tooltip on hover; when set, label can be abbreviated */
  tooltip?: string;
  icon?: LucideIcon;
  /** Optional id for drilldown lookup */
  id?: string;
};

const KPI_CARD_COLORS = [
  { icon: "bg-sky-500/20 text-sky-600", label: "text-sky-700/90" },
  { icon: "bg-emerald-500/20 text-emerald-600", label: "text-emerald-700/90" },
  { icon: "bg-violet-500/20 text-violet-600", label: "text-violet-700/90" },
  { icon: "bg-amber-500/20 text-amber-600", label: "text-amber-700/90" },
  { icon: "bg-rose-500/20 text-rose-600", label: "text-rose-700/90" },
  { icon: "bg-pink-500/20 text-pink-600", label: "text-pink-700/90" },
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
  /** Compact single-row layout with smaller text */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-sky-100/40 bg-gradient-to-b from-sky-50/60 via-slate-50/40 to-transparent", compact ? "py-5" : "py-4", className)}>
      <div className="container-page">
        <div
          className={cn(
            "grid w-full gap-4",
            compact
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(6,minmax(163px,1fr))]"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(6,minmax(163px,1fr))]"
          )}
        >
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
                  "flex min-h-[88px] min-w-[163px] flex-col rounded-xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:bg-white/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
                  onItemClick && "cursor-pointer"
                )}
              >
                <div className={cn("flex flex-1 flex-col justify-center", compact ? "px-3.5 py-2.5" : "px-4 py-3")}>
                  <div className="flex items-center gap-2">
                    {kpi.icon && (
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-md",
                          compact ? "h-5 w-5" : "h-5 w-5",
                          colors.icon
                        )}
                      >
                        <kpi.icon className={compact ? "h-2.5 w-2.5" : "h-2.5 w-2.5"} strokeWidth={2} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "font-medium uppercase min-w-0 truncate",
                        compact ? "text-[11px] tracking-[0.08em]" : "text-[11px] tracking-[0.14em]",
                        colors.label
                      )}
                    >
                      {kpi.label}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-1 font-semibold tracking-tight tabular-nums text-slate-800 [font-family:var(--font-display)]",
                      compact ? "text-lg" : "text-[22px]"
                    )}
                  >
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
                    <div className={cn("mt-0.5 text-xs opacity-80", colors.label)}>
                      {kpi.helper}
                    </div>
                  )}
                </div>
              </div>
            );
            return (kpi.icon || kpi.tooltip || kpi.helper) ? (
              <Tooltip key={kpi.label} content={tooltipContent}>
                {card}
              </Tooltip>
            ) : (
              card
            );
          })}
        </div>
      </div>
    </div>
  );
}
