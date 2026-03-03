import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Building2, ShieldCheck, AlertCircle, Loader2,
  TrendingUp, DollarSign, BarChart2, Users, Landmark,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { PanelCard } from "@/components/cards/PanelCard";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FdicInst = {
  NAME?: string; CERT?: number; CITY?: string; STNAME?: string;
  ASSET?: number; CLASS?: string; ACTIVE?: number; REPDTE?: string;
  NETINC?: number; INTINC?: number; NONII?: number; LNLSNET?: number;
  DEP?: number; EQ?: number; ROA?: number; ROE?: number;
  NAMEHCR?: string; SPECGRP?: number;
};
type FdicRow = { data: FdicInst };
type FdicResp = { data?: FdicRow[]; meta?: { total?: number } };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtM(v?: number) {
  if (v == null) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}T`;
  if (abs >= 1_000)     return `$${(v / 1_000).toFixed(1)}B`;
  return `$${v.toFixed(0)}M`;
}

function fmtPct(v?: number) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

function fmtDate(d?: string) {
  if (!d || d.length !== 8) return d ?? "—";
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

const CHARTER_MAP: Record<string, string> = {
  N: "National Bank (OCC)", SM: "State Member (FRB)", NM: "State Non-Member (FDIC)",
  SB: "Savings Bank", SA: "Savings Association", OI: "Other Insured",
};
function charterLabel(cls?: string) { return cls ? (CHARTER_MAP[cls] ?? cls) : "—"; }

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useSearch(q: string) {
  return useQuery<FdicResp>({
    queryKey: ["/api/fdic/search", q],
    queryFn: async () => {
      const r = await fetch(`/api/fdic/search?q=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error("FDIC error");
      return r.json();
    },
    enabled: q.length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

function useReport(cert: number | null) {
  return useQuery<FdicResp>({
    queryKey: ["/api/fdic/report", cert],
    queryFn: async () => {
      const r = await fetch(`/api/fdic/report/${cert}`);
      if (!r.ok) throw new Error("FDIC error");
      return r.json();
    },
    enabled: cert != null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

const KPI_COLORS = {
  sky:     { tile: "bg-sky-50 border-sky-100",     text: "text-sky-700",     icon: "text-sky-500"     },
  indigo:  { tile: "bg-indigo-50 border-indigo-100", text: "text-indigo-700", icon: "text-indigo-500"  },
  violet:  { tile: "bg-violet-50 border-violet-100", text: "text-violet-700", icon: "text-violet-500"  },
  emerald: { tile: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: "text-emerald-500" },
  amber:   { tile: "bg-amber-50 border-amber-100",  text: "text-amber-700",   icon: "text-amber-500"   },
  rose:    { tile: "bg-rose-50 border-rose-100",    text: "text-rose-700",    icon: "text-rose-500"    },
} as const;

function KpiTile({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: React.ElementType; color: keyof typeof KPI_COLORS;
}) {
  const c = KPI_COLORS[color];
  return (
    <div className={cn("rounded-xl border px-4 py-3", c.tile)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("h-3.5 w-3.5", c.icon)} strokeWidth={2} />
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide opacity-70", c.text)}>{label}</span>
      </div>
      <p className={cn("text-base font-bold tabular-nums", c.text)}>{value}</p>
    </div>
  );
}

// ─── Report Detail Panel ──────────────────────────────────────────────────────

function ReportDetail({ cert, onClose }: { cert: number; onClose: () => void }) {
  const { data, isLoading, isError } = useReport(cert);
  const inst = data?.data?.[0]?.data;

  const kpis = inst ? [
    { label: "Total Assets",    value: fmtM(inst.ASSET),   icon: DollarSign, color: "sky" as const },
    { label: "Net Loans",       value: fmtM(inst.LNLSNET), icon: Landmark,   color: "indigo" as const },
    { label: "Total Deposits",  value: fmtM(inst.DEP),     icon: Users,      color: "violet" as const },
    { label: "Equity Capital",  value: fmtM(inst.EQ),      icon: BarChart2,  color: "emerald" as const },
    { label: "Net Income",      value: fmtM(inst.NETINC),  icon: TrendingUp, color: (inst.NETINC != null && inst.NETINC < 0 ? "rose" : "emerald") as "rose" | "emerald" },
    { label: "Interest Income", value: fmtM(inst.INTINC),  icon: DollarSign, color: "amber" as const },
    { label: "Return on Assets",value: fmtPct(inst.ROA ? inst.ROA / 100 : undefined), icon: TrendingUp, color: "sky" as const },
    { label: "Return on Equity",value: fmtPct(inst.ROE ? inst.ROE / 100 : undefined), icon: BarChart2,  color: "indigo" as const },
  ] : [];

  return (
    <div className="mt-3">
      <PanelCard
        icon={ShieldCheck}
        title={isLoading ? "Loading call report…" : (inst?.NAME ?? "FDIC Call Report")}
        subtitle={inst ? `Cert #${inst.CERT} · ${inst.CITY}, ${inst.STNAME} · Report: ${fmtDate(inst.REPDTE)}` : undefined}
        right={
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        }
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" /> Fetching FDIC call report data…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <AlertCircle className="h-4 w-4 text-amber-400" /> FDIC data unavailable for this institution.
          </div>
        )}
        {inst && (
          <div className="space-y-4">
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold border",
                inst.ACTIVE
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200",
              )}>
                {inst.ACTIVE ? "Active" : "Inactive"}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                {charterLabel(inst.CLASS)}
              </span>
              {inst.NAMEHCR && (
                <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-100">
                  HC: {inst.NAMEHCR}
                </span>
              )}
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {kpis.map((k) => <KpiTile key={k.label} {...k} />)}
            </div>

            {/* Detail table */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Field</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Full Legal Name",    inst.NAME ?? "—"],
                    ["FDIC Cert #",        `#${inst.CERT}`],
                    ["City / State",       `${inst.CITY}, ${inst.STNAME}`],
                    ["Charter Class",      charterLabel(inst.CLASS)],
                    ["Regulatory Status",  inst.ACTIVE ? "Active (FDIC-insured)" : "Inactive"],
                    ["Report Date",        fmtDate(inst.REPDTE)],
                    ["Non-Interest Income",fmtM(inst.NONII)],
                  ].map(([label, value], i) => (
                    <tr key={label} className={cn("border-b border-slate-50 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                      <td className="px-4 py-2.5 text-slate-500">{label}</td>
                      <td className="px-4 py-2.5 text-slate-800 font-semibold text-right">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-slate-400 text-right">
              Source: FDIC BankFind Suite · All figures in $M unless noted
            </p>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ─── Search Results Row ───────────────────────────────────────────────────────

function ResultRow({ inst, isExpanded, onToggle }: {
  inst: FdicInst; isExpanded: boolean; onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-slate-100 cursor-pointer transition-colors",
          isExpanded ? "bg-[#4285F4]/5" : "bg-white hover:bg-slate-50/60",
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4285F4]/10">
              <Building2 className="h-3.5 w-3.5 text-[#4285F4]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">{inst.NAME}</p>
              <p className="text-[11px] text-slate-400">{inst.CITY}, {inst.STNAME}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 tabular-nums text-right">{fmtM(inst.ASSET)}</td>
        <td className="px-4 py-3 text-[11px] text-slate-500 text-right hidden sm:table-cell">{charterLabel(inst.CLASS)}</td>
        <td className="px-4 py-3 text-right hidden sm:table-cell">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            inst.ACTIVE ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600",
          )}>
            {inst.ACTIVE ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 text-slate-400 text-right">
          {isExpanded ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-4 pb-4">
            <ReportDetail cert={inst.CERT!} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BankCallReport() {
  const [input, setInput]       = useState("");
  const [query, setQuery]       = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, isFetching } = useSearch(query);
  const institutions = (data?.data ?? []).map((r) => r.data);

  const handleSubmit = () => {
    const q = input.trim();
    if (q.length >= 2) { setQuery(q); setExpanded(null); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

  const handleClear = () => { setInput(""); setQuery(""); setExpanded(null); inputRef.current?.focus(); };

  const toggleRow = (cert: number) => setExpanded((prev) => (prev === cert ? null : cert));

  return (
    <SprinkleShell stepId="9" kpis={[]} title="Bank Call Report">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">

        {/* Search card */}
        <PanelCard
          icon={Search}
          title="FDIC Bank Call Report Search"
          subtitle="Search any FDIC-insured institution by name to view its official call report data."
        >
          <div className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="e.g. JPMorgan, Wells Fargo, First National…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/10 transition-all"
              />
              {input && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={input.trim().length < 2}
              className="flex items-center gap-2 rounded-xl bg-[#4285F4] hover:bg-[#3b78e7] disabled:bg-slate-200 disabled:text-slate-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>
        </PanelCard>

        {/* Results card */}
        {query.length >= 2 && (
          <PanelCard
            icon={Building2}
            title={
              isLoading ? "Searching…" :
              isError   ? "Error loading results" :
              `${institutions.length} institution${institutions.length !== 1 ? "s" : ""} found`
            }
            subtitle={query ? `Results for "${query}"` : undefined}
            contentClassName="p-0"
          >
            {isLoading && (
              <div className="flex items-center gap-3 px-5 py-8 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-[#4285F4]" />
                <span className="text-sm">Fetching from FDIC BankFind Suite…</span>
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-3 px-5 py-8 text-slate-400">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <span className="text-sm">Could not reach the FDIC API. Please try again.</span>
              </div>
            )}

            {!isLoading && !isError && institutions.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No institutions found for "<span className="text-slate-600 font-medium">{query}</span>".
                Try a shorter or different name.
              </div>
            )}

            {!isLoading && !isError && institutions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Institution</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Assets</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Charter</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="px-4 py-2.5 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((inst) => inst.CERT != null && (
                      <ResultRow
                        key={inst.CERT}
                        inst={inst}
                        isExpanded={expanded === inst.CERT}
                        onToggle={() => toggleRow(inst.CERT!)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PanelCard>
        )}

        {/* Empty state */}
        {!query && (
          <PanelCard icon={Landmark} title="Search FDIC-Insured Institutions" subtitle="Enter any bank name above to retrieve real call report data from the FDIC BankFind Suite API. Click any result to expand the full report.">
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4285F4]/10">
                <Landmark className="h-7 w-7 text-[#4285F4]" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-slate-400 text-center max-w-xs">
                Enter any bank name in the search box above to retrieve live call report data including assets, deposits, income, and regulatory status.
              </p>
            </div>
          </PanelCard>
        )}

      </div>
    </SprinkleShell>
  );
}
