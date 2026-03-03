import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Building2, ShieldCheck, AlertCircle, Loader2,
  TrendingUp, DollarSign, BarChart2, Users, Landmark,
  ChevronDown, ChevronUp, X, ArrowRight, Trophy, MapPin, Zap, FileSpreadsheet,
} from "lucide-react";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { cn } from "@/lib/utils";
import { useLoanContext } from "@/context/LoanContext";
import realStats from "@/data/real/realStats.json";

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

// ─── Quick-search presets ─────────────────────────────────────────────────────

type QuickBank = { label: string; query: string; initial: string; color: "sky" | "indigo" | "violet" | "emerald" | "amber" | "rose"; type: string };

const QUICK_BANKS: QuickBank[] = [
  { label: "JPMorgan",        query: "JPMorgan Chase",    initial: "JP", color: "sky",     type: "FDIC-Insured Bank" },
  { label: "Bank of America", query: "Bank of America",   initial: "BA", color: "indigo",  type: "FDIC-Insured Bank" },
  { label: "Wells Fargo",     query: "Wells Fargo",       initial: "WF", color: "violet",  type: "FDIC-Insured Bank" },
  { label: "Citibank",        query: "Citibank",          initial: "C",  color: "emerald", type: "FDIC-Insured Bank" },
  { label: "US Bank",         query: "US Bank",           initial: "US", color: "amber",   type: "FDIC-Insured Bank" },
  { label: "PNC Bank",        query: "PNC Bank",          initial: "PN", color: "rose",    type: "FDIC-Insured Bank" },
  { label: "Truist",          query: "Truist Bank",       initial: "T",  color: "sky",     type: "FDIC-Insured Bank" },
  { label: "Regions Bank",    query: "Regions Bank",      initial: "R",  color: "rose",    type: "FDIC-Insured Bank" },
];

const QUICK_BANK_COLORS: Record<QuickBank["color"], { badge: string; ring: string }> = {
  sky:     { badge: "bg-sky-500",     ring: "ring-sky-300"     },
  indigo:  { badge: "bg-indigo-500",  ring: "ring-indigo-300"  },
  violet:  { badge: "bg-violet-500",  ring: "ring-violet-300"  },
  emerald: { badge: "bg-emerald-500", ring: "ring-emerald-300" },
  amber:   { badge: "bg-amber-500",   ring: "ring-amber-300"   },
  rose:    { badge: "bg-rose-500",    ring: "ring-rose-300"    },
};

// ─── Buyer Insight Cards ──────────────────────────────────────────────────────

type InsightColor = "sky" | "emerald" | "amber" | "violet";

type BuyerInsight = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ElementType;
  color: InsightColor;
  banks: QuickBank[];
};

const INSIGHT_PALETTE: Record<InsightColor, { card: string; icon: string; iconBg: string; tag: string; chip: string }> = {
  sky:     { card: "border-sky-100/60 bg-sky-50/60",     icon: "text-sky-600",     iconBg: "bg-sky-100",     tag: "bg-sky-100 text-sky-700",     chip: "bg-sky-100 hover:bg-sky-200 text-sky-800"     },
  emerald: { card: "border-emerald-100/60 bg-emerald-50/60", icon: "text-emerald-600", iconBg: "bg-emerald-100", tag: "bg-emerald-100 text-emerald-700", chip: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800" },
  amber:   { card: "border-amber-100/60 bg-amber-50/60",   icon: "text-amber-600",   iconBg: "bg-amber-100",   tag: "bg-amber-100 text-amber-700",   chip: "bg-amber-100 hover:bg-amber-200 text-amber-800"   },
  violet:  { card: "border-violet-100/60 bg-violet-50/60", icon: "text-violet-600",  iconBg: "bg-violet-100",  tag: "bg-violet-100 text-violet-700",  chip: "bg-violet-100 hover:bg-violet-200 text-violet-800"  },
};

const BUYER_INSIGHTS: BuyerInsight[] = [
  {
    id: "top-buyers",
    title: "Top Buyers",
    subtitle: "Highest-volume mortgage acquirers with proven execution and deep capital markets.",
    tag: "Most Active",
    icon: Trophy,
    color: "sky",
    banks: [
      { label: "JPMorgan",        query: "JPMorgan Chase",  initial: "JP", color: "sky",    type: "FDIC-Insured Bank" },
      { label: "Bank of America", query: "Bank of America", initial: "BA", color: "indigo", type: "FDIC-Insured Bank" },
      { label: "Wells Fargo",     query: "Wells Fargo",     initial: "WF", color: "violet", type: "FDIC-Insured Bank" },
    ],
  },
  {
    id: "low-risk",
    title: "Low Risk",
    subtitle: "Best-in-class capital ratios, regulatory standing, and credit quality scores.",
    tag: "AAA-Rated",
    icon: ShieldCheck,
    color: "emerald",
    banks: [
      { label: "Goldman Sachs",   query: "Goldman Sachs Bank",  initial: "GS", color: "emerald", type: "FDIC-Insured Bank" },
      { label: "US Bank",         query: "US Bank",             initial: "US", color: "amber",   type: "FDIC-Insured Bank" },
      { label: "Citibank",        query: "Citibank",            initial: "C",  color: "sky",     type: "FDIC-Insured Bank" },
    ],
  },
  {
    id: "high-capacity",
    title: "High Capacity",
    subtitle: "Largest balance sheets and deposit bases — able to absorb bulk pool acquisitions.",
    tag: "Bulk Ready",
    icon: Zap,
    color: "amber",
    banks: [
      { label: "PNC Bank",        query: "PNC Bank",            initial: "PN", color: "rose",    type: "FDIC-Insured Bank" },
      { label: "Truist",          query: "Truist Bank",         initial: "T",  color: "sky",     type: "FDIC-Insured Bank" },
      { label: "TD Bank",         query: "TD Bank",             initial: "TD", color: "emerald", type: "FDIC-Insured Bank" },
    ],
  },
  {
    id: "regional-focus",
    title: "Regional Focus",
    subtitle: "Community and regional lenders with geographic expertise in key mortgage markets.",
    tag: "Community",
    icon: MapPin,
    color: "violet",
    banks: [
      { label: "Regions Bank",    query: "Regions Bank",        initial: "R",  color: "rose",    type: "FDIC-Insured Bank" },
      { label: "Fifth Third",     query: "Fifth Third Bank",    initial: "5T", color: "sky",     type: "FDIC-Insured Bank" },
      { label: "KeyBank",         query: "KeyBank",             initial: "K",  color: "indigo",  type: "FDIC-Insured Bank" },
    ],
  },
];

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

// ─── KPI colors ───────────────────────────────────────────────────────────────

const KPI_COLORS = {
  sky:     "bg-sky-50 border-sky-100 text-sky-700",
  indigo:  "bg-indigo-50 border-indigo-100 text-indigo-700",
  violet:  "bg-violet-50 border-violet-100 text-violet-700",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  amber:   "bg-amber-50 border-amber-100 text-amber-700",
  rose:    "bg-rose-50 border-rose-100 text-rose-700",
} as const;

// ─── Report Detail Panel ──────────────────────────────────────────────────────

function ReportDetail({ cert, onClose }: { cert: number; onClose: () => void }) {
  const { data, isLoading, isError } = useReport(cert);
  const inst = data?.data?.[0]?.data;

  const kpis: { label: string; value: string; icon: React.ElementType; color: keyof typeof KPI_COLORS }[] = inst ? [
    { label: "Total Assets",    value: fmtM(inst.ASSET),   icon: DollarSign, color: "sky" },
    { label: "Net Loans",       value: fmtM(inst.LNLSNET), icon: Landmark,   color: "indigo" },
    { label: "Total Deposits",  value: fmtM(inst.DEP),     icon: Users,      color: "violet" },
    { label: "Equity Capital",  value: fmtM(inst.EQ),      icon: BarChart2,  color: "emerald" },
    { label: "Net Income",      value: fmtM(inst.NETINC),  icon: TrendingUp, color: inst.NETINC != null && inst.NETINC < 0 ? "rose" : "emerald" },
    { label: "Interest Income", value: fmtM(inst.INTINC),  icon: DollarSign, color: "amber" },
    { label: "Return on Assets",value: fmtPct(inst.ROA ? inst.ROA / 100 : undefined), icon: TrendingUp, color: "sky" },
    { label: "Return on Equity",value: fmtPct(inst.ROE ? inst.ROE / 100 : undefined), icon: BarChart2,  color: "indigo" },
  ] : [];

  return (
    <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden mt-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white/20 border-b border-white/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-sky-600" strokeWidth={2} />
          </div>
          {isLoading ? (
            <span className="text-sm text-slate-500">Loading call report…</span>
          ) : inst ? (
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{inst.NAME}</p>
              <p className="text-[11px] text-slate-500">
                Cert #{inst.CERT} · {inst.CITY}, {inst.STNAME} · Report: {fmtDate(inst.REPDTE)}
              </p>
            </div>
          ) : (
            <span className="text-sm text-slate-500">FDIC Call Report</span>
          )}
        </div>
        <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/40 hover:text-slate-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" /> Fetching FDIC call report data…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <AlertCircle className="h-4 w-4 text-amber-400" /> FDIC data unavailable for this institution.
          </div>
        )}
        {inst && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold border", inst.ACTIVE ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200")}>
                {inst.ACTIVE ? "Active" : "Inactive"}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-white/60 text-slate-600 border-white/60">
                {charterLabel(inst.CLASS)}
              </span>
              {inst.NAMEHCR && (
                <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-100">
                  HC: {inst.NAMEHCR}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 mb-4">
              {kpis.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={cn("rounded-xl border px-4 py-3", KPI_COLORS[color])}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</span>
                  </div>
                  <p className="text-base font-bold tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/50 bg-white/30 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-white/40 border-b border-white/50">
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
                    <tr key={label} className={cn("border-b border-white/30 last:border-0", i % 2 === 0 ? "bg-white/10" : "bg-white/20")}>
                      <td className="px-4 py-2.5 text-slate-500">{label}</td>
                      <td className="px-4 py-2.5 text-slate-800 font-semibold text-right">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 text-right">Source: FDIC BankFind Suite · All figures in $M unless noted</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ inst, isExpanded, onToggle }: {
  inst: FdicInst; isExpanded: boolean; onToggle: () => void;
}) {
  return (
    <div className={cn(
      "rounded-2xl border transition-all",
      isExpanded
        ? "border-sky-200/60 bg-white/50 backdrop-blur-xl"
        : "border-white/50 bg-white/40 backdrop-blur-xl hover:bg-white/50",
    )}>
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15">
          <Building2 className="h-4 w-4 text-sky-600" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 text-sm truncate">{inst.NAME}</p>
          <p className="text-[11px] text-slate-500">{inst.CITY}, {inst.STNAME} · {fmtM(inst.ASSET)} assets</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", inst.ACTIVE ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
            {inst.ACTIVE ? "Active" : "Inactive"}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <ReportDetail cert={inst.CERT!} onClose={onToggle} />
        </div>
      )}
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function ResultsPanel({ query, institutions, isLoading, isError, expanded, onToggle }: {
  query: string;
  institutions: FdicInst[];
  isLoading: boolean;
  isError: boolean;
  expanded: number | null;
  onToggle: (cert: number) => void;
}) {
  if (!query && !isLoading) return null;

  return (
    <div className="max-w-2xl w-full mb-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2 mb-2">
        <span className="text-xs font-medium text-slate-500">
          {isLoading ? "Searching FDIC BankFind Suite…" :
           isError   ? "Could not reach FDIC API" :
           `${institutions.length} institution${institutions.length !== 1 ? "s" : ""} found for "${query}"`}
        </span>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl px-5 py-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
          <span className="text-sm text-slate-500">Fetching from FDIC BankFind Suite…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl px-5 py-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <span className="text-sm text-slate-500">Could not reach the FDIC API. Please try again.</span>
        </div>
      )}

      {!isLoading && !isError && institutions.length === 0 && (
        <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl px-5 py-8 text-center">
          <p className="text-sm text-slate-400">No institutions found for "<span className="text-slate-600 font-medium">{query}</span>". Try a shorter or different name.</p>
        </div>
      )}

      {!isLoading && !isError && institutions.length > 0 && (
        <div className="space-y-2">
          {institutions.map((inst) => inst.CERT != null && (
            <ResultCard
              key={inst.CERT}
              inst={inst}
              isExpanded={expanded === inst.CERT}
              onToggle={() => onToggle(inst.CERT!)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BankCallReport() {
  const [input, setInput]       = useState("");
  const [query, setQuery]       = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const resultsScrollRef        = useRef<HTMLDivElement>(null);

  const { importedLoans } = useLoanContext();

  const { data, isLoading, isError, isFetching } = useSearch(query);
  const institutions = (data?.data ?? []).map((r) => r.data);

  useEffect(() => {
    if (resultsScrollRef.current) {
      resultsScrollRef.current.scrollTop = 0;
    }
  }, [query]);

  const sellerNames: string[] = useMemo(() => {
    if (importedLoans && importedLoans.length > 0) {
      const names = Array.from(new Set(importedLoans.map(l => l.source).filter(Boolean))) as string[];
      return names.length > 0 ? names : Object.keys((realStats as any).bySource ?? {});
    }
    return Object.keys((realStats as any).bySource ?? {});
  }, [importedLoans]);

  const handleSubmit = useCallback(() => {
    const q = input.trim();
    if (q.length >= 2) { setQuery(q); setExpanded(null); }
  }, [input]);

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

  const handleClear = () => { setInput(""); setQuery(""); setExpanded(null); inputRef.current?.focus(); };

  const handleQuick = (bank: QuickBank) => {
    setInput(bank.query);
    setQuery(bank.query);
    setExpanded(null);
  };

  const toggleRow = (cert: number) => setExpanded((prev) => (prev === cert ? null : cert));

  return (
    <SprinkleShell stepId="9" kpis={[]} title="Bank Call Report">
      {/* Full-height hero layout — results scroll up, search pinned to bottom */}
      <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">

        {/* Scrollable results area */}
        <div
          ref={resultsScrollRef}
          className="flex-1 overflow-y-auto flex flex-col items-center px-4 min-h-0 pb-4 pt-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
        >
          {!query && (
            <div className="max-w-2xl w-full mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 text-center mb-3">
                Buyer Intelligence
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Sellers card — from uploaded tape or default real data */}
                <div className="rounded-2xl border border-rose-100/60 bg-rose-50/60 backdrop-blur-sm p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                      <FileSpreadsheet className="h-4 w-4 text-rose-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">Your Sellers</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {importedLoans ? "Uploaded Tape" : "Real Data"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Loan sellers in your current portfolio tape. Look up their FDIC profiles.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sellerNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => handleQuick({ label: name, query: name, initial: name[0], color: "rose", type: "Loan Seller" })}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all bg-rose-100 hover:bg-rose-200 text-rose-800"
                      >
                        <Building2 className="h-3 w-3" />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                {BUYER_INSIGHTS.map((insight) => {
                  const p = INSIGHT_PALETTE[insight.color];
                  const Icon = insight.icon;
                  return (
                    <div
                      key={insight.id}
                      className={cn(
                        "rounded-2xl border backdrop-blur-sm p-4 flex flex-col gap-3",
                        p.card
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", p.iconBg)}>
                            <Icon className={cn("h-4.5 w-4.5", p.icon)} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{insight.title}</p>
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", p.tag)}>{insight.tag}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{insight.subtitle}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {insight.banks.map((bank) => (
                          <button
                            key={bank.query}
                            onClick={() => handleQuick(bank)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                              p.chip
                            )}
                          >
                            <Building2 className="h-3 w-3" />
                            {bank.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ResultsPanel
            query={query}
            institutions={institutions}
            isLoading={isLoading || isFetching}
            isError={isError}
            expanded={expanded}
            onToggle={toggleRow}
          />
        </div>

        {/* Fixed bottom strip — quick banks + search bar */}
        <div className="flex-shrink-0 flex flex-col items-center px-4 pb-8 pt-3">

          {/* Quick-search buyer cards */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4 max-w-2xl w-full">
            {QUICK_BANKS.map((bank) => {
              const colors = QUICK_BANK_COLORS[bank.color];
              const isActive = query === bank.query;
              return (
                <button
                  key={bank.query}
                  onClick={() => handleQuick(bank)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 border shadow-sm hover:shadow-md",
                    isActive
                      ? "bg-white border-slate-300 shadow-md ring-2 " + colors.ring
                      : "bg-white/70 border-white/60 backdrop-blur-sm hover:bg-white hover:border-slate-200",
                  )}
                >
                  <div className={cn("h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-white text-[10px] font-black tracking-tight shadow-sm", colors.badge)}>
                    {bank.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 whitespace-nowrap">{bank.label}</div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">{bank.type}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative max-w-2xl w-full">
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 shadow-[0_8px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm border border-white/20 bg-white">
              <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search any FDIC-insured bank by name…"
                className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
              />
              {(isLoading || isFetching) && (
                <Loader2 className="h-4 w-4 text-sky-500 animate-spin flex-shrink-0" />
              )}
              <div className="flex items-center gap-1 flex-shrink-0">
                {input && (
                  <button
                    onClick={handleClear}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={input.trim().length < 2}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Search 4,500+ FDIC-insured institutions · Live data from FDIC BankFind Suite
          </p>
        </div>
      </div>
    </SprinkleShell>
  );
}
