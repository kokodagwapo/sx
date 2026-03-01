import { useState, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Tooltip({
  children,
  content,
  side = "top",
  className,
  wrapperClassName,
}: {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  wrapperClassName?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const tooltipHeight = 32;
    const tooltipWidth = 200;

    let top = 0;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    switch (side) {
      case "top":
        top = rect.top - tooltipHeight - gap;
        break;
      case "bottom":
        top = rect.bottom + gap;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + gap;
        break;
    }

    setPosition({ top, left });
  }, [side]);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, 300);
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  const tooltipEl = visible && (
    <div
      className={cn(
        "pointer-events-none fixed z-[9999] max-w-[280px] rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-xl shadow-slate-200/50 backdrop-blur-md",
        className
      )}
      style={{
        top: position.top,
        left: Math.max(12, Math.min(position.left, window.innerWidth - 296)),
      }}
    >
      {content}
    </div>
  );

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-flex", wrapperClassName)}
    >
      {children}
      {tooltipEl && createPortal(tooltipEl, document.body)}
    </div>
  );
}
