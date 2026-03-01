import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PASTEL_COLORS } from "@/styles/chartPalette";

export type DonutDatum = {
  name: string;
  value: number;
  color?: string;
};

export function DonutChart({
  data,
  innerRadius = 58,
  outerRadius = 86,
  onSegmentClick,
  animationDuration = 700,
}: {
  data: DonutDatum[];
  innerRadius?: number;
  outerRadius?: number;
  onSegmentClick?: (name: string) => void;
  animationDuration?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isPercent = total >= 99 && total <= 101;
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 12 }}
            formatter={(value: number | undefined) => (value != null && isPercent ? `${value.toFixed(1)}%` : value ?? "")}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={animationDuration}
            animationEasing="ease-out"
            onClick={onSegmentClick ? (e) => onSegmentClick(e?.name ?? "") : undefined}
            cursor={onSegmentClick ? "pointer" : undefined}
          >
            {data.map((entry, i) => (
              <Cell key={`${entry.name}-${i}`} fill={entry.color ?? PASTEL_COLORS[i % PASTEL_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-slate-500">
            {isPercent ? "Total" : "Sum"}
          </div>
          <div className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {isPercent ? "100%" : Intl.NumberFormat("en-US").format(total)}
          </div>
        </div>
      </div>
    </div>
  );
}


