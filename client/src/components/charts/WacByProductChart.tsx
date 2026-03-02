import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

export type WacByProductDatum = {
  name: string;
  loans: number;
  wac: number;
};

const BAR_COLORS = ["#4ade80", "#38bdf8", "#a78bfa", "#fb923c", "#f472b6", "#34d399"];
const SCATTER_COLOR = "#f43f5e";

export function WacByProductChart({
  data,
  onBarClick,
  onPointClick,
}: {
  data: WacByProductDatum[];
  onBarClick?: (name: string) => void;
  onPointClick?: (name: string) => void;
}) {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 52, bottom: 12, left: 8 }}
        >
          <defs>
            {BAR_COLORS.map((c, i) => (
              <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                <stop offset="100%" stopColor={c} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="loans"
            orientation="left"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={38}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
          />
          <YAxis
            yAxisId="wac"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={38}
            domain={[2.5, 5]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
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
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            formatter={(value: unknown, name?: string) => {
              const v = typeof value === "number" ? value : null;
              const n = name ?? "";
              if (v == null) return ["", n];
              if (n === "# of Loans") return [v.toLocaleString(), "Loans"];
              if (n === "Weighted Avg Coupon") return [v.toFixed(3), "WAC"];
              return [String(v), n];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(val) => <span style={{ color: "#64748b" }}>{val}</span>}
          />
          <Bar
            yAxisId="loans"
            dataKey="loans"
            name="# of Loans"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={900}
            animationBegin={100}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : "default"}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
            onMouseEnter={(_: unknown, idx: number) => setActiveBar(idx)}
            onMouseLeave={() => setActiveBar(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#barGrad-${i % BAR_COLORS.length})`}
                opacity={activeBar == null || activeBar === i ? 1 : 0.5}
                style={{ transition: "opacity 0.15s ease, filter 0.15s ease", filter: activeBar === i ? `drop-shadow(0 0 6px ${BAR_COLORS[i % BAR_COLORS.length]}99)` : "none" }}
              />
            ))}
          </Bar>
          <Scatter
            yAxisId="wac"
            dataKey="wac"
            fill={SCATTER_COLOR}
            shape="circle"
            r={7}
            name="Weighted Avg Coupon"
            isAnimationActive
            animationDuration={900}
            animationBegin={200}
            animationEasing="ease-out"
            cursor={onPointClick ? "pointer" : "default"}
            onClick={onPointClick ? (e: { payload?: { name?: string } }) => e?.payload?.name && onPointClick(e.payload.name) : undefined}
            style={{ filter: `drop-shadow(0 0 5px ${SCATTER_COLOR}88)` }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
