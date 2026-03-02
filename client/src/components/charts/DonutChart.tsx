import { useState, useCallback } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { DONUT_REFERENCE_COLORS } from "@/styles/chartPalette";

export type DonutDatum = {
  name: string;
  value: number;
  color?: string;
};

type ActiveShapeProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: DonutDatum;
  percent: number;
};

function ActiveShape(props: ActiveShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  const glowId = `glow-${fill.replace('#', '')}`;
  return (
    <g>
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
      {/* Main segment expanded */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `url(#${glowId})` }}
      />
    </g>
  );
}

export function DonutChart({
  data,
  innerRadius = 56,
  outerRadius = 82,
  onSegmentClick,
  animationDuration = 900,
}: {
  data: DonutDatum[];
  innerRadius?: number;
  outerRadius?: number;
  onSegmentClick?: (name: string) => void;
  animationDuration?: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isPercent = total >= 99 && total <= 101;

  const onMouseEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const colors = data.map((d, i) => d.color ?? DONUT_REFERENCE_COLORS[i % DONUT_REFERENCE_COLORS.length]);

  const activeEntry = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Chart */}
      <div className="relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {colors.map((c, i) => (
                <radialGradient key={i} id={`grad-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.75} />
                </radialGradient>
              ))}
            </defs>
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                padding: "8px 12px",
              }}
              itemStyle={{ color: "#e2e8f0" }}
              formatter={(value: number | undefined) =>
                value != null && isPercent ? `${value.toFixed(1)}%` : value ?? ""
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              stroke="none"
              strokeWidth={0}
              isAnimationActive
              animationDuration={animationDuration}
              animationBegin={80}
              animationEasing="ease-out"
              activeIndex={activeIndex ?? undefined}
              activeShape={(props: object) => <ActiveShape {...(props as ActiveShapeProps)} />}
              onClick={onSegmentClick ? (e) => onSegmentClick(e?.name ?? "") : undefined}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              cursor={onSegmentClick ? "pointer" : "default"}
            >
              {data.map((_entry, i) => (
                <Cell
                  key={i}
                  fill={`url(#grad-${i})`}
                  style={{
                    transition: "opacity 0.2s ease",
                    opacity: activeIndex == null || activeIndex === i ? 1 : 0.45,
                    filter: activeIndex === i ? `drop-shadow(0 0 6px ${colors[i]}88)` : "none",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center transition-all duration-200">
            {activeEntry ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {activeEntry.name.length > 8 ? activeEntry.name.slice(0, 8) + "…" : activeEntry.name}
                </div>
                <div
                  className="mt-0.5 text-xl font-black tabular-nums"
                  style={{ color: colors[activeIndex!] }}
                >
                  {isPercent ? `${activeEntry.value.toFixed(1)}%` : Intl.NumberFormat("en-US").format(activeEntry.value)}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {isPercent ? "Total" : "Sum"}
                </div>
                <div className="mt-0.5 text-xl font-black tracking-tight text-slate-800 tabular-nums">
                  {isPercent ? "100%" : Intl.NumberFormat("en-US").format(total)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 px-1">
        {data.map((d, i) => (
          <button
            key={d.name}
            type="button"
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all duration-150"
            style={{
              color: colors[i],
              background: activeIndex === i ? `${colors[i]}18` : "transparent",
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => onSegmentClick?.(d.name)}
          >
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: colors[i], boxShadow: `0 0 4px ${colors[i]}88` }}
            />
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
