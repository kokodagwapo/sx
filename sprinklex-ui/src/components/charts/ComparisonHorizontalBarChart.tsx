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
    <div className="rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <div className="text-xs font-semibold text-slate-800">{label}</div>
      <div className="mt-1.5 space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">{current?.name}</span>
          <span className="font-medium tabular-nums text-slate-800">
            {current?.value?.toLocaleString()}K
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">{proForma?.name}</span>
          <span className="font-medium tabular-nums text-slate-800">
            {proForma?.value?.toLocaleString()}K
          </span>
        </div>
      </div>
    </div>
  );
}

export function ComparisonHorizontalBarChart({
  data,
  currentLabel = "As of Last Quarter",
  proFormaLabel = "Projected with Selected Loans",
  currentColor = "#3b82f6",
  proFormaColor = "#dc2626",
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "#475569" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span className="text-slate-600">{v}</span>} />
          <Bar
            dataKey="current"
            name={currentLabel}
            fill={currentColor}
            radius={[0, 6, 6, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            cursor={onBarClick ? "pointer" : undefined}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          />
          <Bar
            dataKey="proForma"
            name={proFormaLabel}
            fill={proFormaColor}
            radius={[0, 6, 6, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            animationBegin={150}
            cursor={onBarClick ? "pointer" : undefined}
            onClick={onBarClick ? (e) => onBarClick(e?.name ?? "") : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

