import { useState } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp, TrendingDown, Minus, BarChart2, CreditCard, Activity } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

type ProductRate = {
  label: string;
  rate: number;
  prev: number;
  rangeLow: number;
  rangeHigh: number;
};

export type RatesData = {
  mortgage30: { rate: number; prev: number; trend: number[]; asOf: string };
  treasury10: { rate: number; prev: number; trend: number[]; asOf: string };
  products: ProductRate[];
};

type Tab = "indices" | "credit" | "trends";

// ─── Credit × LTV adjustment table (spreads over base conforming rate) ───────
const CREDIT_BANDS = ["760+", "740–759", "720–739", "700–719", "680–699", "660–679", "<660"];
const LTV_BANDS = ["≤60%", "60–70%", "70–75%", "75–80%", "80–90%", ">90%"];
const CREDIT_ADJ: Record<string, number[]> = {
  "760+":    [ 0.000,  0.000,  0.000,  0.000,  0.125,  0.250],
  "740–759": [ 0.000,  0.000,  0.000,  0.125,  0.250,  0.375],
  "720–739": [ 0.000,  0.000,  0.125,  0.250,  0.375,  0.500],
  "700–719": [ 0.000,  0.125,  0.250,  0.375,  0.500,  0.625],
  "680–699": [ 0.125,  0.250,  0.375,  0.500,  0.625,  0.750],
  "660–679": [ 0.375,  0.500,  0.625,  0.750,  0.875,  1.000],
  "<660":    [ 0.625,  0.750,  1.000,  1.250,  1.375,  1.500],
};

function adjColor(v: number) {
  if (v === 0) return "bg-emerald-50 text-emerald-700 font-semibold";
  if (v <= 0.25) return "bg-amber-50 text-amber-700";
  if (v <= 0.75) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

// ─── Rate card ────────────────────────────────────────────────────────────────
function RateCard({ product }: { product: ProductRate }) {
  const diff = parseFloat((product.rate - product.prev).toFixed(3));
  const up = diff > 0;
  const down = diff < 0;
  return (
    <div className="border border-slate-100 p-5 flex flex-col gap-1 bg-white hover:bg-slate-50/50 transition-colors">
      <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{product.label}</div>
      <div className="text-3xl font-bold text-sky-500 tabular-nums mt-1">
        {product.rate.toFixed(3)}%
      </div>
      <div className={cn("flex items-center gap-1 text-sm font-bold tabular-nums", up ? "text-emerald-600" : down ? "text-red-500" : "text-slate-400")}>
        {up ? <TrendingUp className="h-3.5 w-3.5" /> : down ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {up ? "+" : ""}{diff.toFixed(3)}
      </div>
      <div className="text-[11px] text-slate-400 mt-0.5">
        30-DAY RANGE: {product.rangeLow.toFixed(3)}% – {product.rangeHigh.toFixed(3)}%
      </div>
    </div>
  );
}

// ─── Trend chart ──────────────────────────────────────────────────────────────
function TrendChart({ label, trend, color }: { label: string; trend: number[]; color: string }) {
  const data = trend.slice(-30).map((v, i) => ({ i: i + 1, rate: v }));
  const avg = data.reduce((s, d) => s + d.rate, 0) / (data.length || 1);
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</div>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="i" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              width={40}
            />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(3)}%`, label]}
              contentStyle={{ fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 6 }}
            />
            <ReferenceLine y={avg} stroke="#94a3b8" strokeDasharray="4 2" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>30-day avg: {avg.toFixed(3)}%</span>
        <span>Latest: {data.at(-1)?.rate.toFixed(3)}%</span>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function RateModal({ data, onClose }: { data: RatesData; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("indices");

  const tabs: { id: Tab; label: string; icon: typeof BarChart2 }[] = [
    { id: "indices", label: "Rate Indices",    icon: BarChart2 },
    { id: "credit",  label: "Credit and LTV",  icon: CreditCard },
    { id: "trends",  label: "Rate Trends",     icon: Activity },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-base font-bold text-slate-800">Mortgage Rate Index</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Optimal Blue OBMMI — live rates and indices via FRED
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === id
                  ? "border-sky-500 text-sky-700 bg-sky-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Rate Indices */}
          {tab === "indices" && (
            <div>
              <div className="grid grid-cols-3 divide-x divide-y divide-slate-100">
                {data.products.map((p) => <RateCard key={p.label} product={p} />)}
              </div>
              <div className="border-t border-slate-100 px-6 py-3 grid grid-cols-2 gap-4 bg-slate-50/40">
                {[
                  { label: "10-YR TREASURY", ...data.treasury10 },
                  { label: "30-YR CONFORMING (FRED)", ...data.mortgage30 },
                ].map((r) => {
                  const diff = parseFloat((r.rate - r.prev).toFixed(3));
                  const up = diff > 0;
                  return (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 tabular-nums">{r.rate.toFixed(3)}%</span>
                        <span className={cn("text-xs font-semibold tabular-nums", up ? "text-emerald-600" : "text-red-500")}>
                          {up ? "▲" : "▼"}{Math.abs(diff).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 pb-3 pt-1.5 text-[10px] text-slate-400">
                As of {data.mortgage30.asOf} · Source: Freddie Mac PMMS via FRED · OBMMI spreads estimated
              </div>
            </div>
          )}

          {/* Credit and LTV */}
          {tab === "credit" && (
            <div className="p-6">
              <div className="mb-3 text-sm text-slate-600">
                Rate spread adjustments (in %) by FICO score and LTV bucket over the 30-YR conforming base rate of{" "}
                <strong className="text-sky-700">{data.products[0]?.rate.toFixed(3)}%</strong>. Based on Fannie Mae LLPA matrix.
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-3 py-2.5 text-left font-semibold text-slate-600">FICO / LTV</th>
                      {LTV_BANDS.map((l) => (
                        <th key={l} className="px-3 py-2.5 text-center font-semibold text-slate-600">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {CREDIT_BANDS.map((band) => (
                      <tr key={band} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{band}</td>
                        {(CREDIT_ADJ[band] ?? []).map((v, i) => (
                          <td key={i} className={cn("px-3 py-2 text-center tabular-nums rounded-sm", adjColor(v))}>
                            {v === 0 ? "—" : `+${v.toFixed(3)}`}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-[10px] text-slate-400">
                Values represent price adjustments added to the base conforming rate. Source: Fannie Mae LLPA matrix (2024 edition). Green = no adjustment.
              </div>
            </div>
          )}

          {/* Rate Trends */}
          {tab === "trends" && (
            <div className="p-6 space-y-6">
              <TrendChart
                label="30-YR Conforming Mortgage (FRED MORTGAGE30US)"
                trend={data.mortgage30.trend}
                color="#0ea5e9"
              />
              <TrendChart
                label="10-YR Treasury Yield (FRED DGS10)"
                trend={data.treasury10.trend}
                color="#6366f1"
              />
              <div className="text-[10px] text-slate-400">
                Data via Federal Reserve Economic Data (FRED). 30-YR mortgage: weekly (Freddie Mac PMMS). 10-YR Treasury: daily business days. Up to last 30 observations shown.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
