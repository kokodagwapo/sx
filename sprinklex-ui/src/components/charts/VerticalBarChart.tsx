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
import { PASTEL_COLORS, BAR_VALUE_COLORS } from "@/styles/chartPalette";

export type VerticalBarDatum = {
  name: string;
  value: number;
};

function getValueBasedColor(value: number, maxVal: number): string {
  if (maxVal <= 0) return BAR_VALUE_COLORS[0];
  const t = value / maxVal;
  const idx = Math.min(
    Math.floor(t * (BAR_VALUE_COLORS.length - 1)),
    BAR_VALUE_COLORS.length - 1
  );
  return BAR_VALUE_COLORS[idx];
}

export function VerticalBarChart({
  data,
  color = PASTEL_COLORS[0],
  valueBasedColors = false,
  showLabels = false,
  onBarClick,
}: {
  data: VerticalBarDatum[];
  color?: string;
  valueBasedColors?: boolean;
  showLabels?: boolean;
  onBarClick?: (name: string) => void;
}) {
  const maxVal = Math.max(0, ...data.map((d) => d.value));
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.35)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={36} />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.15)" }}
            contentStyle={{ fontSize: 12, borderRadius: 12 }}
          />
          <Bar
            dataKey="value"
            fill={valueBasedColors ? undefined : color}
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : undefined}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          >
            {valueBasedColors &&
              data.map((entry, i) => (
                <Cell key={`${entry.name}-${i}`} fill={getValueBasedColor(entry.value, maxVal)} />
              ))}
            {showLabels && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(label) =>
                  typeof label === "number" ? label.toLocaleString() : String(label ?? "")
                }
                style={{ fontSize: 11, fill: "#475569", fontFamily: "var(--font-sans)" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

