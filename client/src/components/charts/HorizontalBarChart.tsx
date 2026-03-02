import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DONUT_REFERENCE_COLORS } from "@/styles/chartPalette";

const PASTEL_CYCLE = [
  '#4ade80', '#38bdf8', '#a78bfa', '#fb923c',
  '#f472b6', '#34d399', '#facc15', '#60a5fa',
];

export type HorizontalBarDatum = {
  name: string;
  value: number;
};

function CustomTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const formatted = unit === "%" ? `${v.toFixed(1)}%` : v.toLocaleString();
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 shadow-xl backdrop-blur-sm">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-white">
        {formatted}{unit === "%" ? " of Tier 1 + ALLL" : ""}
      </div>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  color,
  yAxisWidth = 140,
  valueBasedColors = false,
  colorScheme = "blue",
  unit = "",
  domain,
  xAxisLabel,
  onBarClick,
  showValueLabels = false,
}: {
  data: HorizontalBarDatum[];
  color?: string;
  yAxisWidth?: number;
  valueBasedColors?: boolean;
  colorScheme?: "blue" | "fico" | "geo";
  unit?: string;
  domain?: [number, number];
  xAxisLabel?: string;
  onBarClick?: (name: string) => void;
  showValueLabels?: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const hasLongNames = data.some((d) => d.name.length > 18);
  const axisWidth = hasLongNames ? Math.max(yAxisWidth, 160) : yAxisWidth;
  const tickFormatter = unit === "%" ? (v: number) => `${v}%` : undefined;

  const barColor = (i: number, value: number, maxVal: number): string => {
    if (color) return color;
    if (valueBasedColors) {
      const t = maxVal > 0 ? value / maxVal : 0;
      const idx = Math.min(Math.floor(t * (DONUT_REFERENCE_COLORS.length - 1)), DONUT_REFERENCE_COLORS.length - 1);
      return DONUT_REFERENCE_COLORS[idx];
    }
    return PASTEL_CYCLE[i % PASTEL_CYCLE.length];
  };

  const maxVal = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="h-full w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 12, right: showValueLabels ? 56 : 24, bottom: 12, left: 8 }}
        >
          <defs>
            {data.map((d, i) => {
              const c = barColor(i, d.value, maxVal);
              return (
                <linearGradient key={i} id={`hbg-${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={c} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={c} stopOpacity={1} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="rgba(148,163,184,0.15)" />
          <XAxis
            type="number"
            domain={domain}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={tickFormatter}
            axisLine={false}
            tickLine={false}
            label={xAxisLabel ? { value: xAxisLabel, position: "bottom", fontSize: 11, fill: "#64748b" } : undefined}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={axisWidth}
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ fill: "rgba(99,102,241,0.05)" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            maxBarSize={32}
            isAnimationActive
            animationDuration={800}
            animationBegin={80}
            animationEasing="ease-out"
            onClick={onBarClick ? (d: { name?: string }) => d?.name && onBarClick(d.name) : undefined}
            cursor={onBarClick ? "pointer" : "default"}
            onMouseEnter={(_: unknown, idx: number) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {data.map((d, i) => {
              const c = barColor(i, d.value, maxVal);
              return (
                <Cell
                  key={i}
                  fill={`url(#hbg-${i})`}
                  opacity={activeIdx == null || activeIdx === i ? 1 : 0.45}
                  style={{
                    transition: "opacity 0.15s ease, filter 0.15s ease",
                    filter: activeIdx === i ? `drop-shadow(0 0 6px ${c}99)` : "none",
                  }}
                />
              );
            })}
            {showValueLabels && (
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) =>
                  typeof v === "number"
                    ? unit === "%" ? `${v.toFixed(1)}%` : v.toLocaleString()
                    : ""
                }
                style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
