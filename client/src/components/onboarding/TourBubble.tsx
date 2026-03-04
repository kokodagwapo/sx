import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Volume2, VolumeX, ChevronLeft, ChevronRight, X,
  Lightbulb, Map, LayoutList, BellDot, UploadCloud, BarChart3,
  Sparkles, DollarSign, Building2, ShieldCheck, SendHorizonal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTour } from "@/context/TourContext";
import { COHI_TOUR_STOPS } from "@/data/cohiTour";

export type TourStep = {
  title: string;
  body: string;
  cta?: string;
  icon?: "lightbulb" | "map" | "list" | "bell" | "upload" | "chart";
  target?: string;
};

export type TourPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center";

export function TourBubble(_props: {
  stepKey: string;
  steps: TourStep[];
  position?: TourPosition;
  delay?: number;
}) {
  return null;
}

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

function computePosition(targetRect: DOMRect, bubbleW: number, bubbleH: number): ComputedPos {
  const GAP = 14;
  const PAD = 12;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const spaceBelow = winH - targetRect.bottom;
  const spaceAbove = targetRect.top;
  const spaceRight = winW - targetRect.right;
  const spaceLeft  = targetRect.left;

  let side: Side;
  if      (spaceBelow >= bubbleH + GAP) side = "bottom";
  else if (spaceAbove >= bubbleH + GAP) side = "top";
  else if (spaceRight >= bubbleW + GAP) side = "right";
  else if (spaceLeft  >= bubbleW + GAP) side = "left";
  else side = spaceAbove >= spaceBelow ? "top" : "bottom";

  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;
  let top: number, left: number;

  if (side === "bottom") {
    top  = targetRect.bottom + GAP;
    left = clamp(cx - bubbleW / 2, PAD, winW - bubbleW - PAD);
  } else if (side === "top") {
    top  = targetRect.top - bubbleH - GAP;
    left = clamp(cx - bubbleW / 2, PAD, winW - bubbleW - PAD);
  } else if (side === "right") {
    left = targetRect.right + GAP;
    top  = clamp(cy - bubbleH / 2, PAD, winH - bubbleH - PAD);
  } else {
    left = targetRect.left - bubbleW - GAP;
    top  = clamp(cy - bubbleH / 2, PAD, winH - bubbleH - PAD);
  }

  top  = clamp(top,  PAD, winH - bubbleH - PAD);
  left = clamp(left, PAD, winW - bubbleW - PAD);

  const arrowX = (side === "bottom" || side === "top") ? clamp(cx - left, 16, bubbleW - 16) : undefined;
  const arrowY = (side === "left"   || side === "right") ? clamp(cy - top, 16, bubbleH - 16) : undefined;
  return { top, left, side, arrowX, arrowY };
}

function TargetHighlight({ rect }: { rect: DOMRect }) {
  const PAD = 5;
  return createPortal(
    <div
      className="pointer-events-none fixed z-[1049] rounded-xl ring-2 ring-sky-400 ring-offset-1 animate-tour-pulse"
      style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
    />,
    document.body,
  );
}

function Arrow({ side, arrowX, arrowY }: { side: Side; arrowX?: number; arrowY?: number }) {
  const base = "absolute w-3 h-3 bg-white border-slate-200/80 rotate-45";
  if (side === "bottom") return <div className={cn(base, "border-t border-l -top-1.5")} style={{ left: (arrowX ?? 40) - 6 }} />;
  if (side === "top")    return <div className={cn(base, "border-b border-r -bottom-1.5")} style={{ left: (arrowX ?? 40) - 6 }} />;
  if (side === "right")  return <div className={cn(base, "border-l border-b -left-1.5")} style={{ top: (arrowY ?? 40) - 6 }} />;
  return                        <div className={cn(base, "border-t border-r -right-1.5")} style={{ top: (arrowY ?? 40) - 6 }} />;
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  );
}

const ICON_MAP = {
  lightbulb: Lightbulb,
  map:        Map,
  list:       LayoutList,
  bell:       BellDot,
  upload:     UploadCloud,
  chart:      BarChart3,
  sparkles:   Sparkles,
  dollar:     DollarSign,
  building:   Building2,
  shield:     ShieldCheck,
};

const DOT_WINDOW = 7;

const SECTIONS: { label: string; firstStop: number; abbr: string }[] = [
  { label: "Welcome",    abbr: "Intro",  firstStop: 0  },
  { label: "Step 1",     abbr: "Geo",    firstStop: 3  },
  { label: "Step 2",     abbr: "Search", firstStop: 6  },
  { label: "Step 3",     abbr: "Credit", firstStop: 9  },
  { label: "Step 4",     abbr: "Price",  firstStop: 12 },
  { label: "Step 5",     abbr: "Fin",    firstStop: 15 },
  { label: "Step 6a",    abbr: "Comp",   firstStop: 18 },
  { label: "Step 6b",    abbr: "Yield",  firstStop: 21 },
  { label: "Step 7",     abbr: "Sched",  firstStop: 24 },
  { label: "Step 8",     abbr: "Deal",   firstStop: 27 },
  { label: "Step 9",     abbr: "Cohort", firstStop: 30 },
  { label: "Bank CR",    abbr: "Bank",   firstStop: 33 },
];

export function CohiTourPanel() {
  const {
    isActive, stopIndex, totalStops, currentStop,
    goNext, goPrev, goToStop, endTour,
    isSpeaking, isLoadingTts, isPreloaded, isPreloading,
    timeLeft, audioDuration, isThinking, cohiReply,
    speakCurrent, stopSpeaking, askCohi, clearReply,
  } = useTour();

  const [pos, setPos] = useState<ComputedPos | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [chatInput, setChatInput] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isActive || !currentStop?.target) { setPos(null); setTargetRect(null); return; }
    function measure() {
      const el = document.querySelector(`[data-tour="${currentStop!.target}"]`);
      if (!el) { setPos(null); setTargetRect(null); return; }
      const tRect = el.getBoundingClientRect();
      setTargetRect(tRect);
      if (!panelRef.current) return;
      const bRect = panelRef.current.getBoundingClientRect();
      setPos(computePosition(tRect, bRect.width || 384, bRect.height || 360));
    }
    const t = setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isActive, currentStop?.target, stopIndex]);

  useEffect(() => {
    setChatInput("");
  }, [stopIndex]);

  useEffect(() => {
    if (cohiReply) {
      replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [cohiReply]);

  if (!isActive || !currentStop) return null;

  const IconComp = ICON_MAP[currentStop.icon] ?? Lightbulb;
  const isFirst = stopIndex === 0;
  const isLast  = stopIndex === totalStops - 1;
  const progress = ((stopIndex + 1) / totalStops) * 100;

  const hasTarget = !!currentStop.target;
  const style: React.CSSProperties = hasTarget && pos
    ? { position: "fixed", top: pos.top, left: pos.left }
    : { position: "fixed", bottom: 216, right: 24 };

  const dotStart = Math.max(0, Math.min(stopIndex - Math.floor(DOT_WINDOW / 2), totalStops - DOT_WINDOW));
  const dotEnd   = Math.min(totalStops, dotStart + DOT_WINDOW);

  async function handleSend() {
    const q = chatInput.trim();
    if (!q || isThinking) return;
    setChatInput("");
    await askCohi(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") { clearReply(); setChatInput(""); }
  }

  return (
    <>
      {hasTarget && targetRect && <TargetHighlight rect={targetRect} />}
      {createPortal(
        <div
          ref={panelRef}
          className="z-[1050] w-96 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_48px_rgba(56,189,248,0.28)] animate-fade-in-up"
          style={style}
        >
          {hasTarget && pos && <Arrow side={pos.side} arrowX={pos.arrowX} arrowY={pos.arrowY} />}

          {/* Progress bar */}
          <div className="h-1 w-full bg-slate-100 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wide">Cohi</span>
                <span className="text-[10px] text-slate-400">· AI Guide</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-md bg-sky-500/15">
                  <IconComp className="h-2.5 w-2.5 text-sky-600" strokeWidth={2.5} />
                </div>
                <span className="text-[12px] font-bold text-slate-800 leading-tight truncate">{currentStop.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-slate-400 tabular-nums">{stopIndex + 1}/{totalStops}</span>
              <button
                type="button"
                onClick={endTour}
                className="rounded-md p-0.5 text-slate-300 hover:text-slate-500 transition-colors ml-1"
                title="End tour"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tour script */}
          <div className="px-4 pb-2">
            <p className="text-[12px] leading-relaxed text-slate-600">{currentStop.script}</p>
          </div>

          {/* Cohi AI reply bubble */}
          {(cohiReply || isThinking) && (
            <div className="mx-4 mb-2 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50/60 border border-sky-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Cohi says</span>
              </div>
              {isThinking ? (
                <div className="flex items-center gap-1 text-[12px] text-slate-500">
                  Thinking<ThinkingDots />
                </div>
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-700">{cohiReply}</p>
              )}
              <div ref={replyEndRef} />
            </div>
          )}

          {/* Chat input */}
          <div className="px-4 pb-3">
            <div className={cn(
              "flex items-center gap-2 rounded-xl border bg-slate-50/60 px-3 py-2 transition-all",
              isThinking ? "border-sky-200 bg-sky-50/40" : "border-slate-100 focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm"
            )}>
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cohi anything…"
                disabled={isThinking}
                className="flex-1 bg-transparent text-[12px] text-slate-700 placeholder:text-slate-400 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!chatInput.trim() || isThinking}
                className={cn(
                  "shrink-0 rounded-lg p-1.5 transition-all",
                  chatInput.trim() && !isThinking
                    ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-sm"
                    : "text-slate-300 cursor-not-allowed"
                )}
              >
                <SendHorizonal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Voice button row */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={isLoadingTts ? undefined : isSpeaking ? stopSpeaking : speakCurrent}
                disabled={isThinking || isLoadingTts}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
                  isSpeaking
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 ring-1 ring-rose-200"
                    : isLoadingTts
                      ? "bg-sky-50 text-sky-500 cursor-wait"
                      : isThinking
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isPreloaded
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 ring-1 ring-emerald-200"
                          : "bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95"
                )}
              >
                {isLoadingTts ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60" strokeLinecap="round" />
                    </svg>
                    <span>Generating…</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <span className="flex items-end gap-[2px] h-3.5">
                      {[0.6, 1.0, 0.75, 0.9].map((h, i) => (
                        <span
                          key={i}
                          className="inline-block w-[3px] rounded-full bg-rose-500 animate-bounce"
                          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s`, animationDuration: "0.65s" }}
                        />
                      ))}
                    </span>
                    <span>
                      {timeLeft > 0
                        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")} left`
                        : "Stop"}
                    </span>
                    <VolumeX className="h-3 w-3 opacity-60" />
                  </>
                ) : isPreloaded ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Play</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Hear Cohi</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-slate-400 italic">
                {isLoadingTts
                  ? "generating audio…"
                  : isSpeaking
                    ? `shimmer · ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")} remaining`
                    : isPreloading
                      ? "preloading…"
                      : isPreloaded
                        ? "ready to play"
                        : cohiReply
                          ? "AI reply"
                          : "voice guide"}
              </span>
            </div>
            {isSpeaking && audioDuration > 0 && (
              <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-300 ease-linear rounded-full"
                  style={{ width: `${((audioDuration - timeLeft) / audioDuration) * 100}%` }}
                />
              </div>
            )}
            {isPreloading && !isSpeaking && (
              <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-sky-300 to-sky-400 rounded-full animate-preload-slide" />
              </div>
            )}
          </div>

          {/* Section jump strip */}
          <div className="border-t border-slate-100 bg-slate-50/40 px-3 pt-2 pb-1.5">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Jump to section</div>
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {SECTIONS.map((sec) => {
                const isCurrentSection = stopIndex >= sec.firstStop &&
                  (SECTIONS.findIndex(s => s.firstStop === sec.firstStop) === SECTIONS.length - 1
                    ? true
                    : stopIndex < SECTIONS[SECTIONS.findIndex(s => s.firstStop === sec.firstStop) + 1].firstStop);
                return (
                  <button
                    key={sec.firstStop}
                    type="button"
                    onClick={() => goToStop(sec.firstStop)}
                    title={sec.label}
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold transition-all active:scale-95 whitespace-nowrap",
                      isCurrentSection
                        ? "bg-sky-500 text-white shadow-sm"
                        : stopIndex > sec.firstStop
                          ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                          : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-sky-300 hover:text-sky-600"
                    )}
                  >
                    {sec.abbr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav footer */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirst}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                  isFirst
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-white hover:shadow-sm active:scale-95"
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: dotEnd - dotStart }, (_, i) => {
                  const realIdx = dotStart + i;
                  return (
                    <button
                      key={realIdx}
                      type="button"
                      onClick={() => goToStop(realIdx)}
                      title={`Stop ${realIdx + 1}: ${COHI_TOUR_STOPS[realIdx]?.title ?? ""}`}
                      className={cn(
                        "rounded-full transition-all duration-300 hover:scale-150 active:scale-100",
                        realIdx === stopIndex
                          ? "w-4 h-1.5 bg-sky-500"
                          : realIdx < stopIndex
                            ? "w-1.5 h-1.5 bg-sky-300 hover:bg-sky-400"
                            : "w-1.5 h-1.5 bg-slate-200 hover:bg-slate-400"
                      )}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={isLast ? endTour : goNext}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-95"
              >
                {isLast ? "Finish 🎉" : <><span>Next</span><ChevronRight className="h-3.5 w-3.5" /></>}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
