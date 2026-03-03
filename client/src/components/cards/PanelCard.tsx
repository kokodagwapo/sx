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
    <div className="min-w-0 flex items-start gap-2.5">
      {Icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4285F4]/10 text-[#4285F4]">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        {title && (
          <div className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>
        )}
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/60",
        className,
      )}
    >
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          {(tooltip ?? (typeof title === "string" ? title : null)) && (title || Icon) ? (
            <Tooltip content={tooltip ?? (typeof title === "string" ? title : "")}>{headerContent}</Tooltip>
          ) : (
            headerContent
          )}
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={cn("px-4 py-3", contentClassName)}>{children}</div>
    </section>
  );
}

