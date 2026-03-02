import { useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_COLOR = "#a78bfa";

export type ScatterDatum = { x: number; y: number; name?: string };

export function ScatterPlot({
  data,
  xLabel,
  yLabel,
  color = DEFAULT_COLOR,
}: {
  data: ScatterDatum[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.18)" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -4, fontSize: 11, fill: "#64748b" } : undefined}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" } : undefined}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              backgroundColor: "rgba(15,23,42,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
            itemStyle={{ color: "#e2e8f0" }}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            data={data}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
