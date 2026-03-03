import { useState, useEffect } from "react";
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
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (isTourStepDismissed(stepKey)) {
      setVisible(false);
    } else {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [stepKey, tourVersion, delay]);

  if (!visible || steps.length === 0) return null;

  const current = steps[Math.min(idx, steps.length - 1)];
  const isLast = idx >= steps.length - 1;
  const IconComponent = STEP_ICON[current.icon ?? "lightbulb"];

  const handleNext = () => {
    if (isLast) {
      dismissTourStep(stepKey);
      setVisible(false);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const handleSkipAll = () => {
    dismissAllTours();
    setVisible(false);
  };

  const posClass: Record<TourPosition, string> = {
    "bottom-right":  "bottom-6 right-6",
    "bottom-left":   "bottom-6 left-[280px]",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
    "top-right":     "top-20 right-6",
    "top-left":      "top-20 left-[280px]",
  };

  return (
    <div
      className={cn(
        "fixed z-[1050] w-80 rounded-2xl border border-sky-200/70 bg-white overflow-hidden",
        "shadow-[0_8px_48px_rgba(56,189,248,0.22)]",
        "animate-fade-in-up",
        posClass[position],
      )}
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400" />

      {/* Progress dots */}
      {steps.length > 1 && (
        <div className="flex justify-center gap-1 pt-2.5 pb-0.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === idx
                  ? "w-5 bg-sky-500"
                  : i < idx
                  ? "w-1.5 bg-sky-300"
                  : "w-1.5 bg-slate-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
            <IconComponent className="h-4 w-4 text-sky-600" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-bold text-slate-800 leading-snug">{current.title}</span>
        </div>
        <button
          type="button"
          onClick={handleSkipAll}
          className="shrink-0 rounded p-0.5 text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
          title="Dismiss tour"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <p className="px-4 pb-3.5 text-[12px] leading-relaxed text-slate-600">{current.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <button
          type="button"
          onClick={handleSkipAll}
          className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Dismiss all tips
        </button>
        <div className="flex items-center gap-2.5">
          {steps.length > 1 && (
            <span className="text-[10px] font-medium text-slate-400">
              {idx + 1} / {steps.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:scale-95"
          >
            {current.cta ?? (isLast ? "Got it" : "Next")}
            {!isLast && <ChevronRight className="h-3 w-3" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
