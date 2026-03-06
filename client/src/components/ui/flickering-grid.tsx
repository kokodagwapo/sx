"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  colors?: string[];
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  blendSpeed?: number;
  timeScale?: number;
  drift?: boolean;
  mouseRepel?: boolean;
  mouseRadius?: number;
  mouseForce?: number;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  colors,
  width,
  height,
  className,
  maxOpacity = 0.3,
  blendSpeed = 0.9,
  timeScale = 0.35,
  drift = true,
  mouseRepel = false,
  mouseRadius = 120,
  mouseForce = 28,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  const rgbaPrefixes = useMemo(() => {
    const toRGBA = (c: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const ctx = cv.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    const pal = (colors && colors.length > 0) ? colors : [color];
    return pal.map(toRGBA);
  }, [color, colors]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.floor(w / (squareSize + gridGap));
      const rows = Math.floor(h / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      const targets = new Float32Array(cols * rows);
      const colorIndex = new Uint8Array(cols * rows);
      const speedMult = new Float32Array(cols * rows);
      const phase = new Float32Array(cols * rows);
      const displaceX = new Float32Array(cols * rows);
      const displaceY = new Float32Array(cols * rows);

      const palLen = Math.max(1, rgbaPrefixes.length);
      for (let i = 0; i < squares.length; i++) {
        const base = Math.random() * maxOpacity;
        squares[i] = base;
        targets[i] = base;
        speedMult[i] = 0.25 + Math.random() * 0.85;
        phase[i] = Math.random() * Math.PI * 2;
        displaceX[i] = 0;
        displaceY[i] = 0;
        if (palLen === 1) colorIndex[i] = 0;
        else {
          const r = Math.random();
          if (r < 0.70) colorIndex[i] = 0;
          else colorIndex[i] = 1 + Math.floor(Math.random() * (palLen - 1));
        }
      }

      return { cols, rows, squares, targets, colorIndex, speedMult, phase, displaceX, displaceY, dpr };
    },
    [squareSize, gridGap, maxOpacity, rgbaPrefixes.length],
  );

  const updateSquares = useCallback(
    (
      squares: Float32Array,
      targets: Float32Array,
      speedMult: Float32Array,
      deltaTime: number,
      tScale: number,
    ) => {
      const scaledDt = deltaTime * tScale;
      for (let i = 0; i < squares.length; i++) {
        const spd = speedMult[i] ?? 1;
        const ease = 1 - Math.exp(-scaledDt * Math.max(0.08, blendSpeed * spd));
        if (Math.random() < flickerChance * scaledDt * spd) {
          targets[i] = Math.random() * maxOpacity;
        }
        squares[i] = squares[i] + (targets[i] - squares[i]) * ease;
      }
    },
    [flickerChance, maxOpacity, blendSpeed],
  );

  const updateDisplacement = useCallback(
    (
      displaceX: Float32Array,
      displaceY: Float32Array,
      cols: number,
      rows: number,
      deltaTime: number,
      mRadius: number,
      mForce: number,
    ) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;
      const returnSpeed = 4.5;
      const rSq = mRadius * mRadius;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          const cellX = i * (squareSize + gridGap) + squareSize * 0.5;
          const cellY = j * (squareSize + gridGap) + squareSize * 0.5;

          let targetDx = 0;
          let targetDy = 0;

          if (active) {
            const dx = cellX - mx;
            const dy = cellY - my;
            const distSq = dx * dx + dy * dy;

            if (distSq < rSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const strength = (1 - dist / mRadius);
              const force = strength * strength * mForce;
              targetDx = (dx / dist) * force;
              targetDy = (dy / dist) * force;
            }
          }

          const ease = 1 - Math.exp(-deltaTime * returnSpeed);
          displaceX[idx] += (targetDx - displaceX[idx]) * ease;
          displaceY[idx] += (targetDy - displaceY[idx]) * ease;
        }
      }
    },
    [squareSize, gridGap],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      colorIndex: Uint8Array,
      phase: Float32Array,
      displaceX: Float32Array,
      displaceY: Float32Array,
      dpr: number,
      timeMs: number,
      enableDrift: boolean,
    ) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          const opacity = squares[idx];
          const palIdx = Math.min(rgbaPrefixes.length - 1, colorIndex[idx] ?? 0);
          ctx.fillStyle = `${rgbaPrefixes[palIdx]}${opacity})`;
          const dx = displaceX[idx] ?? 0;
          const dy = displaceY[idx] ?? 0;
          const x = (i * (squareSize + gridGap) + dx) * dpr;
          const y = (j * (squareSize + gridGap) + dy) * dpr;
          ctx.fillRect(x, y, squareSize * dpr, squareSize * dpr);
        }
      }
    },
    [rgbaPrefixes, squareSize, gridGap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number = 0;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.active = inside;
    };

    if (mouseRepel) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(
        gridParams.squares,
        gridParams.targets,
        gridParams.speedMult,
        deltaTime,
        timeScale,
      );

      if (mouseRepel) {
        updateDisplacement(
          gridParams.displaceX,
          gridParams.displaceY,
          gridParams.cols,
          gridParams.rows,
          deltaTime,
          mouseRadius,
          mouseForce,
        );
      }

      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.colorIndex,
        gridParams.phase,
        gridParams.displaceX,
        gridParams.displaceY,
        gridParams.dpr,
        time,
        drift,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (mouseRepel) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [setupCanvas, updateSquares, updateDisplacement, drawGrid, width, height, isInView, timeScale, drift, mouseRepel, mouseRadius, mouseForce]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export { FlickeringGrid };
