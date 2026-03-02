import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_REFERENCE_COLORS } from "@/styles/chartPalette";

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
            contentStyle={{ 
              fontSize: 12, 
              borderRadius: 12,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}
            formatter={(value: number | undefined) => (value != null && isPercent ? `${value.toFixed(1)}%` : value ?? "")}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            stroke="#fff"
            strokeWidth={2}
            isAnimationActive
            animationDuration={animationDuration}
            animationEasing="ease-out"
            onClick={onSegmentClick ? (e) => onSegmentClick(e?.name ?? "") : undefined}
            cursor={onSegmentClick ? "pointer" : undefined}
          >
            {data.map((entry, i) => (
              <Cell key={`${entry.name}-${i}`} fill={entry.color ?? DONUT_REFERENCE_COLORS[i % DONUT_REFERENCE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
            {isPercent ? "Total" : "Sum"}
          </div>
          <div className="mt-0.5 text-2xl font-bold tracking-tight text-slate-800 tabular-nums">
            {isPercent ? "100%" : Intl.NumberFormat("en-US").format(total)}
          </div>
        </div>
      </div>
    </div>
  );
}


