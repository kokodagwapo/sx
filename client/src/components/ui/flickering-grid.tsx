"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  /** Optional palette for subtle multi-color squares */
  colors?: string[];
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  /** How quickly squares ease to their new opacity (lower = slower/cinematic) */
  blendSpeed?: number;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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

      // Heavily favor first palette color; allow subtle “spark” accents.
      const palLen = Math.max(1, rgbaPrefixes.length);
      for (let i = 0; i < squares.length; i++) {
        const base = Math.random() * maxOpacity;
        squares[i] = base;
        targets[i] = base;
        if (palLen === 1) colorIndex[i] = 0;
        else {
          const r = Math.random();
          // Slightly more “sparkle” accents so the grid reads on white.
          if (r < 0.70) colorIndex[i] = 0;
          else colorIndex[i] = 1 + Math.floor(Math.random() * (palLen - 1));
        }
      }

      return { cols, rows, squares, targets, colorIndex, dpr };
    },
    [squareSize, gridGap, maxOpacity, rgbaPrefixes.length],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, targets: Float32Array, deltaTime: number) => {
      const ease = 1 - Math.exp(-deltaTime * Math.max(0.1, blendSpeed));
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          targets[i] = Math.random() * maxOpacity;
        }
        squares[i] = squares[i] + (targets[i] - squares[i]) * ease;
      }
    },
    [flickerChance, maxOpacity, blendSpeed],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      targets: Float32Array,
      colorIndex: Uint8Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          const opacity = squares[idx];
          const palIdx = Math.min(rgbaPrefixes.length - 1, colorIndex[idx] ?? 0);
          ctx.fillStyle = `${rgbaPrefixes[palIdx]}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
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

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, gridParams.targets, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.targets,
        gridParams.colorIndex,
        gridParams.dpr,
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
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export { FlickeringGrid };

