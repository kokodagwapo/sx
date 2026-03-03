import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, ShieldCheck, AlertCircle, Loader2, ExternalLink,
  DollarSign, MapPin, Hash, Layers, X, TrendingUp, BarChart2, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BUYER_REGISTRY, BUYER_COLOR_MAP, type BuyerEntry } from "@/data/mock/buyerRegistry";

// ─── Minimal loan shape needed by this component ──────────────────────────────

export type BuyerLoan = {
  id: string;
  state: string;
  product: string;
  upb: number;
  coupon: number;
  status: string;
  purpose: string;
  fico: number;
  ltv: number;
};

// ─── FDIC types ───────────────────────────────────────────────────────────────

type FdicInstitution = {
  NAME?: string; CERT?: number; CITY?: string; STNAME?: string;
  ASSET?: number; CLASS?: string; ACTIVE?: number; REPDTE?: string;
};
type FdicResponse = { data?: Array<{ data: FdicInstitution }>; error?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAssets(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}B`;
  if (v >= 1_000)         return `$${(v / 1_000).toFixed(0)}M`;
  return `$${v}K`;
}

function charterLabel(cls?: string): string {
  const map: Record<string, string> = {
    N: "National Bank (OCC)", SM: "State Member (FRB)", NM: "State Non-Member",
    SB: "Savings Bank", SA: "Savings Association", OI: "Other Insured",
  };
  return cls ? (map[cls] ?? cls) : "—";
}

function fmtDate(d: string): string {
  return d.length === 8
    ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`
    : d;
}

function topN<T extends { count: number }>(map: Record<string, T>, n: number) {
  return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, n);
}

// ─── FDIC data hook ───────────────────────────────────────────────────────────

function useFdic(cert?: number) {
  return useQuery<FdicResponse>({
    queryKey: ["/api/fdic/institution", cert],
    queryFn: async () => {
      const res = await fetch(`/api/fdic/institution/${cert}`);
      if (!res.ok) throw new Error("FDIC error");
      return res.json();
    },
    enabled: cert != null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function TypeBadge({ type }: { type: BuyerEntry["type"] }) {
  const map = {
    bank:         { label: "FDIC-Insured Bank",      cls: "bg-sky-100 text-sky-700" },
    credit_union: { label: "NCUA Credit Union",       cls: "bg-emerald-100 text-emerald-700" },
    insurance:    { label: "Insurance Co.",           cls: "bg-amber-100 text-amber-700" },
    gse:          { label: "Gov't-Sponsored Entity",  cls: "bg-violet-100 text-violet-700" },
  };
  const { label, cls } = map[type];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", cls)}>
      {label}
    </span>
  );
}

function MiniBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 truncate text-[11px] text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-600">{count.toLocaleString()}</span>
    </div>
  );
}

// ─── Full FDIC detail block (used inside the modal) ───────────────────────────

function FdicDetailBlock({ cert, colors }: { cert: number; colors: typeof BUYER_COLOR_MAP[string] }) {
  const { data, isLoading, isError } = useFdic(cert);

  if (isLoading) return (
    <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
      <Loader2 className="h-4 w-4 animate-spin" /> Fetching FDIC Call Report…
    </div>
  );
  if (isError || !data?.data?.length) return (
    <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
      <AlertCircle className="h-4 w-4 text-amber-400" /> FDIC data unavailable
    </div>
  );

  const inst = data.data[0].data;
  const rows = [
    { label: "Full Legal Name",    value: inst.NAME ?? "—" },
    { label: "FDIC Cert #",        value: `#${inst.CERT ?? cert}` },
    { label: "City / State",       value: `${inst.CITY ?? "—"}, ${inst.STNAME ?? "—"}` },
    { label: "Total Assets",       value: fmtAssets(inst.ASSET ?? 0) },
    { label: "Charter Class",      value: charterLabel(inst.CLASS) },
    { label: "Regulatory Status",  value: inst.ACTIVE ? "Active (FDIC-insured)" : "Inactive" },
    { label: "Report Date",        value: inst.REPDTE ? fmtDate(inst.REPDTE) : "—" },
  ];

  return (
    <div className={cn("rounded-xl border p-4", colors.border, colors.bg)}>
      <div className="flex items-center gap-1.5 mb-3">
        <ShieldCheck className={cn("h-4 w-4", colors.text)} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", colors.text)}>FDIC Call Report</span>
        <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", inst.ACTIVE ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
          {inst.ACTIVE ? "Active" : "Inactive"}
        </span>
      </div>
      <dl className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="text-[11px] text-slate-500 shrink-0">{label}</dt>
            <dd className="text-[11px] font-semibold text-slate-800 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Compact FDIC block (used in the summary card) ────────────────────────────

function FdicCompact({ cert, colors }: { cert: number; colors: typeof BUYER_COLOR_MAP[string] }) {
  const { data, isLoading, isError } = useFdic(cert);
  if (isLoading) return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-1">
      <Loader2 className="h-3 w-3 animate-spin" /> Fetching FDIC data…
    </div>
  );
  if (isError || !data?.data?.length) return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-1">
      <AlertCircle className="h-3 w-3 text-amber-400" /> FDIC data unavailable
    </div>
  );
  const inst = data.data[0].data;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-700 truncate">{inst.NAME ?? "—"}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500"><Hash className="h-2.5 w-2.5 shrink-0" /><span>Cert #{inst.CERT ?? cert}</span></div>
        <div className="flex items-center gap-1 text-slate-500"><MapPin className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{inst.CITY}, {inst.STNAME}</span></div>
        <div className="flex items-center gap-1 text-slate-500"><DollarSign className="h-2.5 w-2.5 shrink-0" /><span>Assets: {fmtAssets(inst.ASSET ?? 0)}</span></div>
        <div className="flex items-center gap-1 text-slate-500"><Layers className="h-2.5 w-2.5 shrink-0" /><span>{charterLabel(inst.CLASS)}</span></div>
      </div>
      {inst.REPDTE && <p className="text-[9px] text-slate-300">As of {fmtDate(inst.REPDTE)} · FDIC Call Report</p>}
    </div>
  );
}

// ─── Drilldown modal ──────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Available:  "bg-emerald-100 text-emerald-700",
  Allocated:  "bg-amber-100  text-amber-700",
  Committed:  "bg-sky-100    text-sky-700",
  Sold:       "bg-slate-100  text-slate-600",
};

function BuyerDetailModal({
  entry, loans, loanCount, totalUpb, colors, onClose,
}: {
  entry: BuyerEntry;
  loans: BuyerLoan[];
  loanCount: number;
  totalUpb: number;
  colors: typeof BUYER_COLOR_MAP[string];
  onClose: () => void;
}) {
  const wac   = loans.length > 0 ? loans.reduce((s, l) => s + l.coupon * l.upb, 0) / (totalUpb || 1) : 0;
  const avgBal = loanCount > 0 ? totalUpb / loanCount : 0;

  const stateCounts = useMemo(() => {
    const m: Record<string, { count: number }> = {};
    for (const l of loans) m[l.state] = { count: (m[l.state]?.count ?? 0) + 1 };
    return m;
  }, [loans]);

  const productCounts = useMemo(() => {
    const m: Record<string, { count: number }> = {};
    for (const l of loans) m[l.product] = { count: (m[l.product]?.count ?? 0) + 1 };
    return m;
  }, [loans]);

  const statusCounts = useMemo(() => {
    const m: Record<string, { count: number }> = {};
    for (const l of loans) m[l.status] = { count: (m[l.status]?.count ?? 0) + 1 };
    return m;
  }, [loans]);

  const topStates   = topN(stateCounts, 8);
  const topProducts = topN(productCounts, 6);
  const maxState    = topStates[0]?.[1].count ?? 1;
  const maxProduct  = topProducts[0]?.[1].count ?? 1;

  const topLoans = useMemo(
    () => [...loans].sort((a, b) => b.upb - a.upb).slice(0, 12),
    [loans],
  );

  const kpis = [
    { label: "Loans",     value: loanCount.toLocaleString(),             icon: FileText },
    { label: "Total UPB", value: `$${(totalUpb / 1_000_000).toFixed(1)}M`, icon: DollarSign },
    { label: "WA Coupon", value: `${wac.toFixed(3)}%`,                   icon: TrendingUp },
    { label: "Avg Balance",value: `$${(avgBal / 1_000).toFixed(0)}K`,    icon: BarChart2 },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className={cn("flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4", colors.bg)}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", colors.border, "bg-white")}>
              <Building2 className={cn("h-5 w-5", colors.text)} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">{entry.displayName}</h2>
                <TypeBadge type={entry.type} />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{entry.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/80 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

            {/* ── Left column ── */}
            <div className="space-y-5">

              {/* KPI strip */}
              <div className="grid grid-cols-2 gap-3">
                {kpis.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status breakdown */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Loan Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusCounts).map(([status, { count }]) => (
                    <div key={status} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_BADGE[status] ?? "bg-slate-100 text-slate-600")}>
                      <span>{status}</span>
                      <span className="opacity-60">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top states */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Top States by Loan Count</p>
                <div className="space-y-1.5">
                  {topStates.map(([state, { count }]) => (
                    <MiniBar key={state} label={state} count={count} max={maxState} color={colors.bg.replace("bg-", "bg-") + " " + colors.text.replace("text-", "bg-").replace("-700","-400").replace("-600","-400")} />
                  ))}
                </div>
              </div>

              {/* Product breakdown */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Mix</p>
                <div className="space-y-1.5">
                  {topProducts.map(([product, { count }]) => (
                    <MiniBar key={product} label={product} count={count} max={maxProduct} color="bg-sky-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-5">

              {/* FDIC or static block */}
              {entry.type === "bank" && entry.fdicCert ? (
                <FdicDetailBlock cert={entry.fdicCert} colors={colors} />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Institution Details</p>
                  <dl className="space-y-2">
                    {[
                      { label: "Full Name",   value: entry.displayName },
                      { label: "Type",        value: entry.type === "credit_union" ? "Federal Credit Union (NCUA)" : "Insurance Company" },
                      { label: "Regulator",   value: entry.type === "credit_union" ? "NCUA" : "State Insurance Dept." },
                      { label: "HQ",          value: entry.hq },
                      { label: "FDIC Status", value: "Not FDIC-insured" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4">
                        <dt className="text-[11px] text-slate-400 shrink-0">{label}</dt>
                        <dd className="text-[11px] font-semibold text-slate-700 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Top loans table */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Top Loans by UPB
                </p>
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Loan ID</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">State</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Product</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-400">UPB</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-400">Rate</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLoans.map((loan, i) => (
                        <tr key={loan.id} className={cn("border-b border-slate-50 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                          <td className="px-3 py-1.5 font-mono text-slate-600 truncate max-w-[80px]">{loan.id}</td>
                          <td className="px-3 py-1.5 font-semibold text-slate-700">{loan.state}</td>
                          <td className="px-3 py-1.5 text-slate-600">{loan.product}</td>
                          <td className="px-3 py-1.5 tabular-nums text-right text-slate-700">${(loan.upb / 1_000).toFixed(0)}K</td>
                          <td className="px-3 py-1.5 tabular-nums text-right text-slate-600">{loan.coupon.toFixed(2)}%</td>
                          <td className="px-3 py-1.5">
                            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", STATUS_BADGE[loan.status] ?? "bg-slate-100 text-slate-600")}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {loans.length > 12 && (
                  <p className="mt-1.5 text-[10px] text-slate-400 text-right">
                    Showing top 12 of {loans.length.toLocaleString()} loans
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Public: BuyerModal (open modal directly by ID) ──────────────────────────

export function BuyerModal({ buyerId, onClose }: { buyerId: string; onClose: () => void }) {
  const entry = BUYER_REGISTRY[buyerId];
  if (!entry) return null;
  const colors = BUYER_COLOR_MAP[entry.color];
  return (
    <BuyerDetailModal
      entry={entry}
      loans={[]}
      loanCount={0}
      totalUpb={0}
      colors={colors}
      onClose={onClose}
    />
  );
}

// ─── Public: BuyerInfoCard (summary card, click → modal) ─────────────────────

export function BuyerInfoCard({
  buyerId, loanCount, totalUpb, loans = [],
}: {
  buyerId: string;
  loanCount: number;
  totalUpb: number;
  loans?: BuyerLoan[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const entry = BUYER_REGISTRY[buyerId];
  if (!entry) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="font-mono text-xs text-slate-500">{buyerId}</p>
        <p className="text-[10px] text-slate-400 mt-1">Unknown institution</p>
      </div>
    );
  }

  const colors = BUYER_COLOR_MAP[entry.color];

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "w-full text-left rounded-xl border bg-white p-3 shadow-sm transition-all duration-150",
          "hover:shadow-md hover:scale-[1.02] active:scale-[0.99] cursor-pointer",
          colors.border,
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
              <Building2 className={cn("h-3.5 w-3.5", colors.text)} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{entry.shortName}</p>
              <p className="font-mono text-[9px] text-slate-400">{entry.id}</p>
            </div>
          </div>
          <TypeBadge type={entry.type} />
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{entry.description}</p>

        <div className="flex gap-3 text-[10px] font-semibold mb-2">
          <div>
            <span className="text-slate-400 font-normal">Loans</span>
            <div className="text-slate-700">{loanCount.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-slate-400 font-normal">UPB</span>
            <div className="text-slate-700">${(totalUpb / 1_000_000).toFixed(1)}M</div>
          </div>
          <div>
            <span className="text-slate-400 font-normal">Avg Bal</span>
            <div className="text-slate-700">${(totalUpb / loanCount / 1_000).toFixed(0)}K</div>
          </div>
        </div>

        {entry.type === "bank" && entry.fdicCert ? (
          <div className={cn("rounded-lg border p-2", colors.border, colors.bg)}>
            <div className="flex items-center gap-1 mb-1">
              <ExternalLink className={cn("h-2.5 w-2.5 shrink-0", colors.text)} />
              <span className={cn("text-[9px] font-bold uppercase tracking-wider", colors.text)}>FDIC Call Report</span>
            </div>
            <FdicCompact cert={entry.fdicCert} colors={colors} />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
            <p className="text-[10px] text-slate-400">
              {entry.type === "credit_union" ? "NCUA-regulated · not FDIC-insured" : "State-regulated · not FDIC-insured"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">HQ: {entry.hq}</p>
          </div>
        )}

        <p className={cn("mt-2 text-[9px] font-semibold text-right", colors.text)}>
          Click for full detail →
        </p>
      </button>

      {modalOpen && (
        <BuyerDetailModal
          entry={entry}
          loans={loans}
          loanCount={loanCount}
          totalUpb={totalUpb}
          colors={colors}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ─── Public: BuyerChip ────────────────────────────────────────────────────────

export function BuyerChip({ buyerId }: { buyerId?: string }) {
  if (!buyerId) return <span className="text-slate-300">—</span>;
  const entry = BUYER_REGISTRY[buyerId];
  if (!entry) return <span className="font-mono text-xs text-slate-500">{buyerId}</span>;
  const colors = BUYER_COLOR_MAP[entry.color];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", colors.chip)}>
      <Building2 className="h-2.5 w-2.5" strokeWidth={2.5} />
      {entry.shortName}
    </span>
  );
}
