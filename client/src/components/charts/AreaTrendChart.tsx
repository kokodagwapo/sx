import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_COLOR = "#38bdf8";
const DEFAULT_FILL = "#7dd3fc";

export type TrendDatum = {
  name: string;
  value: number;
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: TrendDatum;
  color?: string;
  onClick?: (name: string) => void;
}) {
  const { cx, cy, payload, color = DEFAULT_COLOR, onClick } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="white"
        stroke={color}
        strokeWidth={2.5}
        style={{ filter: `drop-shadow(0 0 4px ${color}88)`, cursor: "pointer" }}
        className="transition-transform hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(payload.name);
        }}
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill={color}
        fontSize={11}
        fontWeight={700}
      >
        {payload.value.toFixed(2)}
      </text>
    </g>
  );
}

export function AreaTrendChart({
  data,
  color = DEFAULT_COLOR,
  fillColor = DEFAULT_FILL,
  onPointClick,
  gradientId = "trendFill",
}: {
  data: TrendDatum[];
  color?: string;
  fillColor?: string;
  onPointClick?: (name: string) => void;
  gradientId?: string;
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 28, right: 16, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 6]} tick={{ fontSize: 11, fill: "#64748b" }} width={36} axisLine={false} tickLine={false} />
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
            formatter={(value: number | undefined) => [
              value != null ? value.toFixed(2) + "%" : "",
              "Yield",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            isAnimationActive
            animationDuration={900}
            animationBegin={80}
            animationEasing="ease-out"
            dot={
              onPointClick
                ? (props: { cx?: number; cy?: number; payload?: TrendDatum }) => (
                    <CustomDot {...props} color={color} onClick={onPointClick} />
                  )
                : { r: 5, fill: color, stroke: "white", strokeWidth: 2, style: { filter: `drop-shadow(0 0 4px ${color}88)` } }
            }
            activeDot={
              onPointClick
                ? (props: { cx?: number; cy?: number; payload?: TrendDatum }) => (
                    <CustomDot {...props} color={color} onClick={onPointClick} />
                  )
                : { r: 7, fill: color, stroke: "white", strokeWidth: 2, style: { filter: `drop-shadow(0 0 6px ${color}99)` } }
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
