import { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sprinklex_tour_dismissed";

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function dismiss(stepKey: string) {
  const set = getDismissed();
  set.add(stepKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

function dismissAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(["__all__"]));
}

function isAllDismissed(): boolean {
  return getDismissed().has("__all__");
}

export type TourStep = {
  title: string;
  body: string;
  cta?: string;
};

export function TourBubble({
  stepKey,
  steps,
  position = "bottom-right",
}: {
  stepKey: string;
  steps: TourStep[];
  position?: "bottom-right" | "bottom-left" | "top-right";
}) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (isAllDismissed() || getDismissed().has(stepKey)) {
      setVisible(false);
    } else {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [stepKey]);

  if (!visible || steps.length === 0) return null;

  const current = steps[Math.min(idx, steps.length - 1)];
  const isLast = idx >= steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      dismiss(stepKey);
      setVisible(false);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const handleSkipAll = () => {
    dismissAll();
    setVisible(false);
  };

  const posClass = {
    "bottom-right": "bottom-24 right-6",
    "bottom-left":  "bottom-24 left-6",
    "top-right":    "top-20 right-6",
  }[position];

  return (
    <div
      className={cn(
        "fixed z-[1050] w-72 rounded-2xl border border-sky-200/70 bg-white shadow-[0_8px_40px_rgba(56,189,248,0.18)] overflow-hidden",
        "animate-fade-in-up",
        posClass,
      )}
    >
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/15">
            <Lightbulb className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-slate-800">{current.title}</span>
        </div>
        <button
          type="button"
          onClick={handleSkipAll}
          className="shrink-0 rounded p-0.5 text-slate-300 hover:text-slate-500 transition-colors"
          title="Skip tour"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <p className="px-4 pb-3 text-xs leading-relaxed text-slate-600">{current.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <button
          type="button"
          onClick={handleSkipAll}
          className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {steps.length > 1 && (
            <span className="text-[10px] text-slate-400">
              {idx + 1} / {steps.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
          >
            {current.cta ?? (isLast ? "Got it" : "Next")}
            {!isLast && <ChevronRight className="h-3 w-3" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
