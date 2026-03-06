"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Dot = {
  x: number;
  y: number;
  r: number;
  phase: number;
  cycleMs: number;
  color: string;
  maxAlpha: number;
};

const PALETTE = [
  "#94a3b8",
  "#1D77C3",
  "#2dd4bf",
  "#4E9A4B",
  "#a78bfa",
  "#f59e0b",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function AppearingDots({
  className,
  count = 55,
  minRadius = 1.2,
  maxRadius = 3.5,
  cycleMsMin = 10000,
  cycleMsMax = 22000,
  maxAlpha = 0.45,
}: {
  className?: string;
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  cycleMsMin?: number;
  cycleMsMax?: number;
  maxAlpha?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);

  const initDots = useCallback(
    (w: number, h: number): Dot[] => {
      return Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: minRadius + Math.random() * (maxRadius - minRadius),
        phase: Math.random() * Math.PI * 2,
        cycleMs: cycleMsMin + Math.random() * (cycleMsMax - cycleMsMin),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        maxAlpha: maxAlpha * (0.6 + Math.random() * 0.4),
      }));
    },
    [count, minRadius, maxRadius, cycleMsMin, cycleMsMax, maxAlpha],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dotsRef.current = initDots(w, h);
    };

    const render = (tMs: number) => {
      const dots = dotsRef.current;
      if (dots.length === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const d of dots) {
        const cycle = (tMs / d.cycleMs) * Math.PI * 2 + d.phase;
        const raw = Math.sin(cycle);
        const alpha = Math.max(0, raw) * d.maxAlpha;
        if (alpha < 0.002) continue;

        const [r, g, b] = hexToRgb(d.color);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.arc(d.x * dpr, d.y * dpr, d.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (prefersReducedMotion()) {
      render(0);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [initDots]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    />
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return [148, 163, 184];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
