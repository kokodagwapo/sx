import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WacByProductDatum = {
  name: string;
  loans: number;
  wac: number;
};

const BAR_COLOR = "#2563eb";
const SCATTER_COLOR = "#dc2626";

export function WacByProductChart({
  data,
  onBarClick,
  onPointClick,
}: {
  data: WacByProductDatum[];
  onBarClick?: (name: string) => void;
  onPointClick?: (name: string) => void;
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 12, right: 48, bottom: 12, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.35)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="loans"
            orientation="left"
            tick={{ fontSize: 11 }}
            width={36}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
            label={{ value: "# of Loans", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <YAxis
            yAxisId="wac"
            orientation="right"
            tick={{ fontSize: 11 }}
            width={36}
            domain={[2.5, 5]}
            tickFormatter={(v) => v.toFixed(2)}
            label={{ value: "Weighted Avg Coupon", angle: 90, position: "insideRight", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 12 }}
            formatter={(value: unknown, name?: string) => {
              const v = typeof value === "number" ? value : null;
              const n = name ?? "";
              if (v == null) return ["", n];
              if (n === "loans") return [v.toLocaleString(), "# of Loans"];
              if (n === "wac") return [v.toFixed(2), "WAC"];
              return [String(v), n];
            }}
          />
          <Legend />
          <Bar
            yAxisId="loans"
            dataKey="loans"
            fill={BAR_COLOR}
            radius={[6, 6, 0, 0]}
            name="# of Loans"
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : undefined}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          />
          <Scatter
            yAxisId="wac"
            dataKey="wac"
            fill={SCATTER_COLOR}
            shape="circle"
            r={6}
            name="Weighted Avg Coupon"
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            cursor={onPointClick ? "pointer" : undefined}
            onClick={onPointClick ? (e: { payload?: { name?: string } }) => e?.payload?.name && onPointClick(e.payload.name) : undefined}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
