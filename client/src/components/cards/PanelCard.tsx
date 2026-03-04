import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

export function PanelCard({
  title,
  subtitle,
  icon: Icon,
  tooltip,
  children,
  className,
  contentClassName,
  right,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  tooltip?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const headerContent = (
    <div className="min-w-0 flex items-start gap-2 sm:gap-2.5">
      {Icon && (
        <div className="mt-0.5 flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-[#4285F4]/10 text-[#4285F4]">
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        {title && (
          <div className="text-xs sm:text-sm font-semibold tracking-tight text-slate-900 break-words">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="mt-0.5 text-[10px] sm:text-xs text-slate-500 break-words">{subtitle}</div>
        )}
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:bg-white/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-2 sm:gap-3 border-b border-white/50 bg-white/20 px-3 sm:px-4 py-2.5 sm:py-3 min-w-0">
          {(tooltip ?? (typeof title === "string" ? title : null)) && (title || Icon) ? (
            <Tooltip content={tooltip ?? (typeof title === "string" ? title : "")} wrapperClassName="min-w-0">{headerContent}</Tooltip>
          ) : (
            headerContent
          )}
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={cn("px-3 sm:px-4 py-2.5 sm:py-3 min-w-0", contentClassName)}>{children}</div>
    </section>
  );
}

