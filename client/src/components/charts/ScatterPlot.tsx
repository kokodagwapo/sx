import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PASTEL_COLORS } from "@/styles/chartPalette";

export type ScatterDatum = { x: number; y: number; name?: string };

export function ScatterPlot({
  data,
  xLabel,
  yLabel,
  color = PASTEL_COLORS[2],
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={{ fontSize: 11 }}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -4, fontSize: 11 } : undefined}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={{ fontSize: 11 }}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

