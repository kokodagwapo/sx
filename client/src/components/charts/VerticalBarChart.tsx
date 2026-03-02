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

export type VerticalBarDatum = {
  name: string;
  value: number;
};

const VIVID_COLORS = [
  "#4ade80", "#38bdf8", "#a78bfa", "#fb923c",
  "#f472b6", "#34d399", "#facc15", "#60a5fa",
];

export function VerticalBarChart({
  data,
  color,
  valueBasedColors = false,
  showLabels = true,
  onBarClick,
}: {
  data: VerticalBarDatum[];
  color?: string;
  valueBasedColors?: boolean;
  showLabels?: boolean;
  onBarClick?: (name: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const maxVal = Math.max(1, ...data.map((d) => d.value));

  const barColor = (i: number) => {
    if (color) return color;
    return VIVID_COLORS[i % VIVID_COLORS.length];
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 16, bottom: 8, left: 0 }}>
          <defs>
            {data.map((_, i) => {
              const c = barColor(i);
              return (
                <linearGradient key={i} id={`vbg-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.18)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={38}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
          />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              backgroundColor: "rgba(15,23,42,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              padding: "8px 12px",
            }}
            itemStyle={{ color: "#e2e8f0" }}
            formatter={(v: number) => [v.toLocaleString(), "Loans"]}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={900}
            animationBegin={80}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : "default"}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
            onMouseEnter={(_: unknown, idx: number) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#vbg-${i})`}
                opacity={activeIdx == null || activeIdx === i ? 1 : 0.45}
                style={{
                  transition: "opacity 0.15s ease, filter 0.15s ease",
                  filter: activeIdx === i ? `drop-shadow(0 0 7px ${barColor(i)}99)` : "none",
                }}
              />
            ))}
            {showLabels && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(label: unknown) =>
                  typeof label === "number"
                    ? label >= 1000 ? `${(label / 1000).toFixed(1)}K` : label.toLocaleString()
                    : String(label ?? "")
                }
                style={{ fontSize: 10, fill: "#64748b", fontWeight: 600, fontFamily: "var(--font-sans)" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
