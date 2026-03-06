import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type Dot = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  hue: number;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function CelestialDots({
  className,
  density = 0.00012, // dots per pixel
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let dots: Dot[] = [];
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.min(220, Math.max(70, Math.floor(w * h * density)));
      dots = Array.from({ length: targetCount }).map(() => {
        const baseHue = Math.random() < 0.5 ? 205 : 255; // sky/indigo
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.05,
          a: 0.18 + Math.random() * 0.55,
          tw: 0.6 + Math.random() * 1.6,
          hue: baseHue + (Math.random() * 16 - 8),
        };
      });
    };

    const drawGlows = () => {
      // subtle pastel nebula glows, white base
      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      const g1 = ctx.createRadialGradient(w * 0.18, h * 0.18, 0, w * 0.18, h * 0.18, Math.max(w, h) * 0.55);
      g1.addColorStop(0, "rgba(56,189,248,0.10)");
      g1.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.86, h * 0.22, 0, w * 0.86, h * 0.22, Math.max(w, h) * 0.5);
      g2.addColorStop(0, "rgba(99,102,241,0.10)");
      g2.addColorStop(1, "rgba(99,102,241,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      const g3 = ctx.createRadialGradient(w * 0.55, h * 0.82, 0, w * 0.55, h * 0.82, Math.max(w, h) * 0.55);
      g3.addColorStop(0, "rgba(45,212,191,0.07)");
      g3.addColorStop(1, "rgba(45,212,191,0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    };

    const render = (tMs: number) => {
      const t = tMs / 1000;
      ctx.clearRect(0, 0, w, h);
      drawGlows();

      // dots
      for (const d of dots) {
        const tw = 0.65 + 0.35 * Math.sin(t * d.tw + (d.x + d.y) * 0.01);
        const alpha = d.a * tw;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${d.hue}, 85%, 62%, ${alpha})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        // tiny halo
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.22, alpha)})`;
        ctx.arc(d.x, d.y, d.r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        if (!reduceMotion) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < -20) d.x = w + 20;
          if (d.x > w + 20) d.x = -20;
          if (d.y < -20) d.y = h + 20;
          if (d.y > h + 20) d.y = -20;
        }
      }

      // rare “constellation” lines between near neighbors (subtle)
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "rgba(56,189,248,1)";
      for (let i = 0; i < dots.length; i += 7) {
        const a = dots[i];
        for (let j = i + 1; j < Math.min(i + 12, dots.length); j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // draw once (reduced motion) or animate
    if (reduceMotion) render(0);
    else raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    />
  );
}

