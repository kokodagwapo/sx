import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Maroon/purple palette for yield charts (reference image) */
const YIELD_CHART_COLOR = "#6b2d5c";
const YIELD_CHART_FILL = "#9f5f8f";

export type TrendDatum = {
  name: string;
  value: number;
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: TrendDatum;
  onClick?: (name: string) => void;
}) {
  const { cx, cy, payload, onClick } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="white"
        stroke={YIELD_CHART_COLOR}
        strokeWidth={2}
        className="cursor-pointer transition-transform hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(payload.name);
        }}
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill={YIELD_CHART_COLOR}
        fontSize={11}
        fontWeight={600}
      >
        {payload.value.toFixed(2)}
      </text>
    </g>
  );
}

export function AreaTrendChart({
  data,
  color = YIELD_CHART_COLOR,
  fillColor = YIELD_CHART_FILL,
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
          margin={{ top: 24, right: 16, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.35)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 6]} tick={{ fontSize: 11 }} width={36} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 12 }}
            formatter={(value: number | undefined) => [
              value != null ? value.toFixed(2) + "%" : "",
              "Yield",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
            dot={
              onPointClick
                ? (props: { cx?: number; cy?: number; payload?: TrendDatum }) => (
                    <CustomDot {...props} onClick={onPointClick} />
                  )
                : { r: 4, fill: color, stroke: "white", strokeWidth: 2 }
            }
            activeDot={
              onPointClick
                ? (props: { cx?: number; cy?: number; payload?: TrendDatum }) => (
                    <CustomDot {...props} onClick={onPointClick} />
                  )
                : { r: 5, fill: color, stroke: "white", strokeWidth: 2 }
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

