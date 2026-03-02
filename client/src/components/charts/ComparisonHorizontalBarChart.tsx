import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_CURRENT = "#38bdf8";
const DEFAULT_PROFORMA = "#4ade80";

export type ComparisonDatum = {
  name: string;
  current: number;
  proForma: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const [current, proForma] = payload;
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2.5 shadow-xl backdrop-blur-sm">
      <div className="text-xs font-semibold text-white">{label}</div>
      <div className="mt-1.5 space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">{current?.name}</span>
          <span className="font-medium tabular-nums text-white">{current?.value?.toLocaleString()}K</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">{proForma?.name}</span>
          <span className="font-medium tabular-nums text-white">{proForma?.value?.toLocaleString()}K</span>
        </div>
      </div>
    </div>
  );
}

export function ComparisonHorizontalBarChart({
  data,
  currentLabel = "As of Last Quarter",
  proFormaLabel = "Projected with Selected Loans",
  currentColor = DEFAULT_CURRENT,
  proFormaColor = DEFAULT_PROFORMA,
  onBarClick,
}: {
  data: ComparisonDatum[];
  currentLabel?: string;
  proFormaLabel?: string;
  currentColor?: string;
  proFormaColor?: string;
  onBarClick?: (loanType: string) => void;
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="cmpCurrent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={currentColor} stopOpacity={0.7} />
              <stop offset="100%" stopColor={currentColor} stopOpacity={1} />
            </linearGradient>
            <linearGradient id="cmpProForma" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={proFormaColor} stopOpacity={0.7} />
              <stop offset="100%" stopColor={proFormaColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.15)" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(v) => <span className="text-slate-600">{v}</span>}
          />
          <Bar
            dataKey="current"
            name={currentLabel}
            fill="url(#cmpCurrent)"
            radius={[0, 6, 6, 0]}
            isAnimationActive
            animationDuration={800}
            animationBegin={80}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : "default"}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          />
          <Bar
            dataKey="proForma"
            name={proFormaLabel}
            fill="url(#cmpProForma)"
            radius={[0, 6, 6, 0]}
            isAnimationActive
            animationDuration={800}
            animationBegin={200}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : "default"}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
