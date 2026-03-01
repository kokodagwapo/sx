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
import { PASTEL_COLORS, BAR_VALUE_COLORS, GEO_DISTRIBUTION_COLORS } from "@/styles/chartPalette";

const FICO_COLORS = ["#7dd3fc", "#60a5fa", "#f97316", "#ea580c", "#dc2626", "#991b1b"] as const;

function getValueBasedColor(value: number, maxVal: number, scheme: "blue" | "fico" | "geo" = "blue"): string {
  if (maxVal <= 0) {
    if (scheme === "fico") return FICO_COLORS[0];
    if (scheme === "geo") return GEO_DISTRIBUTION_COLORS[GEO_DISTRIBUTION_COLORS.length - 1];
    return BAR_VALUE_COLORS[0];
  }
  const t = value / maxVal;
  if (scheme === "geo") {
    const idx = Math.floor((1 - t) * GEO_DISTRIBUTION_COLORS.length);
    return GEO_DISTRIBUTION_COLORS[Math.max(0, Math.min(idx, GEO_DISTRIBUTION_COLORS.length - 1))];
  }
  const idx = Math.min(Math.floor(t * 5), scheme === "fico" ? FICO_COLORS.length - 1 : BAR_VALUE_COLORS.length - 1);
  return scheme === "fico" ? FICO_COLORS[idx] : BAR_VALUE_COLORS[idx];
}

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
    <div className="rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800 tabular-nums">
        {formatted} {unit === "%" ? "of Tier 1 + ALLL" : ""}
      </div>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  color = PASTEL_COLORS[2],
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
  /** e.g. "%" for percentage display */
  unit?: string;
  /** X-axis domain e.g. [0, 600] */
  domain?: [number, number];
  /** X-axis label e.g. "# of Selected Loans" */
  xAxisLabel?: string;
  onBarClick?: (name: string) => void;
  showValueLabels?: boolean;
}) {
  const hasLongNames = data.some((d) => d.name.length > 18);
  const axisWidth = hasLongNames ? Math.max(yAxisWidth, 160) : yAxisWidth;
  const maxVal = Math.max(0, ...data.map((d) => d.value));
  const tickFormatter = unit === "%" ? (v: number) => `${v}%` : undefined;
  return (
    <div className="h-full w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 12, right: 48, bottom: 12, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.2)" />
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
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
          />
          <Bar
            dataKey="value"
            fill={valueBasedColors ? undefined : color}
            radius={[0, 6, 6, 0]}
            maxBarSize={32}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            onClick={
              onBarClick
                ? (data: { name?: string }) => data?.name && onBarClick(data.name)
                : undefined
            }
            cursor={onBarClick ? "pointer" : undefined}
          >
            {showValueLabels && (
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) =>
                  typeof v === "number"
                    ? unit === "%"
                      ? `${v.toFixed(1)}%`
                      : v.toLocaleString()
                    : ""
                }
                style={{ fontSize: 11, fill: "#475569" }}
              />
            )}
            {valueBasedColors &&
              data.map((entry, i) => (
                <Cell key={`${entry.name}-${i}`} fill={getValueBasedColor(entry.value, maxVal, colorScheme)} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

