import { useEffect, useState } from "react";

/**
 * Animates a numeric value from 0 to target on mount/update.
 */
export function AnimatedCounter({
  value,
  duration = 800,
  decimals = 0,
  className,
}: {
  value: number | string;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  const isInvalid = Number.isNaN(num);
  const [display, setDisplay] = useState<number>(isInvalid ? 0 : num);

  useEffect(() => {
    if (isInvalid) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(num * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [num, duration, isInvalid]);

  if (isInvalid) return <span className={className}>{String(value)}</span>;
  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(display));
  return <span className={className}>{formatted}</span>;
}
