import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lightbulb, ChevronRight, Map, LayoutList, BellDot, UploadCloud, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTour,
  isTourStepDismissed,
  dismissTourStep,
  dismissAllTours,
} from "@/context/TourContext";

export type TourStep = {
  title: string;
  body: string;
  cta?: string;
  icon?: "lightbulb" | "map" | "list" | "bell" | "upload" | "chart";
  target?: string;
};

const STEP_ICON: Record<NonNullable<TourStep["icon"]>, typeof Lightbulb> = {
  lightbulb: Lightbulb,
  map:        Map,
  list:       LayoutList,
  bell:       BellDot,
  upload:     UploadCloud,
  chart:      BarChart3,
};

export type TourPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center";

type Side = "bottom" | "top" | "right" | "left";

interface ComputedPos {
  top: number;
  left: number;
  side: Side;
  arrowX?: number;
  arrowY?: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function computePosition(
  targetRect: DOMRect,
  bubbleW: number,
  bubbleH: number,
): ComputedPos {
  const GAP = 14;
  const PAD = 8;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  const spaceBelow = winH - targetRect.bottom;
  const spaceAbove = targetRect.top;
  const spaceRight = winW - targetRect.right;
  const spaceLeft  = targetRect.left;

  let side: Side;
  if (spaceBelow >= bubbleH + GAP || spaceBelow >= spaceAbove) {
    side = "bottom";
  } else if (spaceAbove >= bubbleH + GAP) {
    side = "top";
  } else if (spaceRight >= bubbleW + GAP) {
    side = "right";
  } else if (spaceLeft >= bubbleW + GAP) {
    side = "left";
  } else {
    side = "bottom";
  }

  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;

  let top: number, left: number;

  if (side === "bottom") {
    top  = targetRect.bottom + GAP;
    left = clamp(cx - bubbleW / 2, PAD, winW - bubbleW - PAD);
    const arrowX = clamp(cx - left, 16, bubbleW - 16);
    return { top, left, side, arrowX };
  } else if (side === "top") {
    top  = targetRect.top - bubbleH - GAP;
    left = clamp(cx - bubbleW / 2, PAD, winW - bubbleW - PAD);
    const arrowX = clamp(cx - left, 16, bubbleW - 16);
    return { top, left, side, arrowX };
  } else if (side === "right") {
    left = targetRect.right + GAP;
    top  = clamp(cy - bubbleH / 2, PAD, winH - bubbleH - PAD);
    const arrowY = clamp(cy - top, 16, bubbleH - 16);
    return { top, left, side, arrowY };
  } else {
    left = targetRect.left - bubbleW - GAP;
    top  = clamp(cy - bubbleH / 2, PAD, winH - bubbleH - PAD);
    const arrowY = clamp(cy - top, 16, bubbleH - 16);
    return { top, left, side, arrowY };
  }
}

function TargetHighlight({ rect }: { rect: DOMRect }) {
  const PAD = 5;
  return createPortal(
    <div
      className="pointer-events-none fixed z-[1049] rounded-xl ring-2 ring-sky-400 ring-offset-1 animate-tour-pulse"
      style={{
        top:    rect.top    - PAD,
        left:   rect.left   - PAD,
        width:  rect.width  + PAD * 2,
        height: rect.height + PAD * 2,
      }}
    />,
    document.body,
  );
}

function Arrow({ side, arrowX, arrowY }: { side: Side; arrowX?: number; arrowY?: number }) {
  const base = "absolute w-3 h-3 bg-white border-slate-200/80 rotate-45";
  if (side === "bottom") {
    return (
      <div
        className={cn(base, "border-t border-l -top-1.5")}
        style={{ left: (arrowX ?? 40) - 6 }}
      />
    );
  }
  if (side === "top") {
    return (
      <div
        className={cn(base, "border-b border-r -bottom-1.5")}
        style={{ left: (arrowX ?? 40) - 6 }}
      />
    );
  }
  if (side === "right") {
    return (
      <div
        className={cn(base, "border-l border-b -left-1.5")}
        style={{ top: (arrowY ?? 40) - 6 }}
      />
    );
  }
  return (
    <div
      className={cn(base, "border-t border-r -right-1.5")}
      style={{ top: (arrowY ?? 40) - 6 }}
    />
  );
}

const FALLBACK_POS: Record<TourPosition, { bottom?: number; top?: number; left?: number; right?: number }> = {
  "bottom-right":  { bottom: 24, right: 24 },
  "bottom-left":   { bottom: 24, left: 280 },
  "bottom-center": { bottom: 24, left: "50%" as unknown as number },
  "top-right":     { top: 80, right: 24 },
  "top-left":      { top: 80, left: 280 },
};

export function TourBubble({
  stepKey,
  steps,
  position = "bottom-right",
  delay = 900,
}: {
  stepKey: string;
  steps: TourStep[];
  position?: TourPosition;
  delay?: number;
}) {
  const { tourVersion } = useTour();
  const [visible, setVisible]           = useState(false);
  const [idx, setIdx]                   = useState(0);
  const [pos, setPos]                   = useState<ComputedPos | null>(null);
  const [targetRect, setTargetRect]     = useState<DOMRect | null>(null);
  const bubbleRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIdx(0);
    setPos(null);
    setTargetRect(null);
    if (isTourStepDismissed(stepKey)) {
      setVisible(false);
    } else {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [stepKey, tourVersion, delay]);

  const current     = steps[Math.min(idx, steps.length - 1)];
  const isLast      = idx >= steps.length - 1;
  const IconComp    = STEP_ICON[current?.icon ?? "lightbulb"];

  useLayoutEffect(() => {
    if (!visible || !current?.target) {
      setPos(null);
      setTargetRect(null);
      return;
    }
    function measure() {
      const el = document.querySelector(`[data-tour="${current.target}"]`);
      if (!el) { setPos(null); setTargetRect(null); return; }
      const tRect = el.getBoundingClientRect();
      setTargetRect(tRect);
      if (!bubbleRef.current) return;
      const bRect = bubbleRef.current.getBoundingClientRect();
      setPos(computePosition(tRect, bRect.width || 320, bRect.height || 200));
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [visible, current?.target, idx]);

  if (!visible || !current) return null;

  const handleNext = () => {
    if (isLast) { dismissTourStep(stepKey); setVisible(false); }
    else { setIdx((i) => i + 1); }
  };
  const handleSkipAll = () => { dismissAllTours(); setVisible(false); };

  const hasTarget = !!current.target;
  const style: React.CSSProperties = hasTarget && pos
    ? { top: pos.top, left: pos.left }
    : FALLBACK_POS[position];

  return (
    <>
      {hasTarget && targetRect && <TargetHighlight rect={targetRect} />}

      {createPortal(
        <div
          ref={bubbleRef}
          className="fixed z-[1050] w-80 rounded-2xl border border-slate-200/80 bg-white overflow-visible shadow-[0_8px_48px_rgba(56,189,248,0.24)] animate-fade-in-up"
          style={style}
        >
          {hasTarget && pos && (
            <Arrow side={pos.side} arrowX={pos.arrowX} arrowY={pos.arrowY} />
          )}

          {/* Gradient accent */}
          <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400" />

          {/* Progress dots */}
          {steps.length > 1 && (
            <div className="flex justify-center gap-1 pt-2.5 pb-0.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === idx       ? "w-5 bg-sky-500"
                    : i < idx       ? "w-1.5 bg-sky-300"
                    :                 "w-1.5 bg-slate-200"
                  )}
                />
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
                <IconComp className="h-4 w-4 text-sky-600" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-slate-800 leading-snug">{current.title}</span>
            </div>
            <button type="button" onClick={handleSkipAll}
              className="shrink-0 rounded-md p-0.5 text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
              title="Dismiss tour">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <p className="px-4 pb-3.5 text-[12px] leading-relaxed text-slate-600">{current.body}</p>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <button type="button" onClick={handleSkipAll}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
              Dismiss all tips
            </button>
            <div className="flex items-center gap-2.5">
              {steps.length > 1 && (
                <span className="text-[10px] font-medium text-slate-400">{idx + 1} / {steps.length}</span>
              )}
              <button type="button" onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:scale-95">
                {current.cta ?? (isLast ? "Got it" : "Next")}
                {!isLast && <ChevronRight className="h-3 w-3" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
