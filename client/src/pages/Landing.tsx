import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Mic, MicOff, Bot, ArrowRight, LayoutList, LayoutGrid,
  Pin, Eye, X, ChevronDown, Trophy, Shield, Sparkles, MapPin,
  Scale, Pencil, Trash2, Check, Plus, ArrowUpRight, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LenderDrilldownModal } from "@/components/buyers/LenderDrilldownModal";
import { usePools } from "@/context/PoolsContext";
import realStats from "@/data/real/realStats.json";

// ─── Types ────────────────────────────────────────────────────────────────────

type InstitutionResult = {
  id: string;
  name: string;
  count: number;
  upb: number;
  waRate: number;
  waFico: number;
  waLtv: number;
  waDti: number;
  avgBal: number;
  products: { p30: number; p15: number; pArm: number };
  status: { avail: number; alloc: number; comm: number; sold: number };
  topStates: { s: string; c: number }[];
  color: "sky" | "amber" | "rose";
};

// ─── Real institution data ────────────────────────────────────────────────────

const INSTITUTIONS: InstitutionResult[] = [
  {
    id: "provident", name: "Provident", color: "sky",
    count: 2452, upb: 711354965, waRate: 3.2781, waFico: 769, waLtv: 61.16, waDti: 31.27, avgBal: 290112,
    products: { p30: 1396, p15: 986, pArm: 70 },
    status: { avail: 1323, alloc: 522, comm: 327, sold: 280 },
    topStates: [{ s: "CA", c: 773 }, { s: "UT", c: 195 }, { s: "WA", c: 176 }, { s: "TX", c: 168 }, { s: "CO", c: 153 }],
  },
  {
    id: "stonegate", name: "Stonegate", color: "amber",
    count: 963, upb: 209093793, waRate: 3.7413, waFico: 716, waLtv: 87.87, waDti: 39.21, avgBal: 217128,
    products: { p30: 901, p15: 62, pArm: 0 },
    status: { avail: 516, alloc: 202, comm: 123, sold: 122 },
    topStates: [{ s: "CA", c: 124 }, { s: "IL", c: 101 }, { s: "OH", c: 74 }, { s: "NJ", c: 60 }, { s: "PA", c: 47 }],
  },
  {
    id: "new-penn-financial", name: "New Penn Financial", color: "rose",
    count: 3637, upb: 940884877, waRate: 3.621, waFico: 732, waLtv: 75.52, waDti: 38.0, avgBal: 258698,
    products: { p30: 3210, p15: 403, pArm: 24 },
    status: { avail: 2010, alloc: 759, comm: 448, sold: 420 },
    topStates: [{ s: "CA", c: 552 }, { s: "FL", c: 310 }, { s: "NY", c: 276 }, { s: "GA", c: 272 }, { s: "PA", c: 265 }],
  },
];

// Per-seller, per-state counts for quick action #4
const SELLER_STATE_COUNTS: Record<string, Record<string, number>> = {
  provident:           { CA: 773, UT: 195, WA: 176, TX: 168, CO: 153, AZ: 138, ID: 95, NV: 78, OR: 61, MT: 32 },
  stonegate:           { CA: 124, IL: 101, OH: 74,  NJ: 60,  PA: 47,  NY: 44,  MI: 38, IN: 27, MO: 22, WI: 18 },
  "new-penn-financial":{ CA: 552, FL: 310, NY: 276, GA: 272, PA: 265, TX: 187, NJ: 163, VA: 148, MD: 121, NC: 98 },
};

const ALL_STATES = Object.keys((realStats as any).byState ?? {}).sort();

// ─── Color helpers ────────────────────────────────────────────────────────────

const COLOR_MAP = {
  sky:   { accent: "bg-sky-600",   light: "bg-sky-50",   text: "text-sky-700",   border: "border-sky-200",   bar: "bg-sky-500",   ring: "ring-sky-400"   },
  amber: { accent: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-400", ring: "ring-amber-400" },
  rose:  { accent: "bg-rose-600",  light: "bg-rose-50",  text: "text-rose-700",  border: "border-rose-200",  bar: "bg-rose-500",  ring: "ring-rose-400"  },
};

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function pct(n: number, total: number) { return total ? ((n / total) * 100).toFixed(0) + "%" : "0%"; }

// ─── LandingNav ───────────────────────────────────────────────────────────────

function LandingNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
          <span className="text-[11px] font-black text-white tracking-tight">SX</span>
        </div>
        <div>
          <span className="text-white font-semibold text-sm tracking-tight">SprinkleX</span>
          <span className="ml-2 text-white/40 text-xs">Loan Portfolio Analytics</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/60 text-sm">Hey, Maylin 👋</span>
        <button
          onClick={() => navigate("/step/1")}
          className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all"
        >
          Open Analytics <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

type SearchBarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  cohiMode: boolean;
  onCohiToggle: () => void;
  isListening: boolean;
  onMicToggle: () => void;
  isLoading: boolean;
};

function SearchBar({ query, onQueryChange, onSubmit, cohiMode, onCohiToggle, isListening, onMicToggle, isLoading }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="relative max-w-2xl w-full">
      <div className={cn(
        "flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_8px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm border border-white/20 transition-all duration-200",
        cohiMode && "ring-2 ring-indigo-500/40",
      )}>
        {cohiMode ? (
          <Bot className="h-5 w-5 text-indigo-500 flex-shrink-0" />
        ) : (
          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={cohiMode ? "Ask Cohi about the portfolio..." : "Search institutions, states, products..."}
          className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
        />
        {isLoading && (
          <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex-shrink-0" />
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMicToggle}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
              isListening ? "bg-red-500 text-white ring-2 ring-red-400 ring-offset-1" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            )}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            onClick={onCohiToggle}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
              cohiMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            )}
            title={cohiMode ? "Cohi AI on" : "Enable Cohi AI"}
          >
            <Bot className="h-4 w-4" />
          </button>
          <button
            onClick={onSubmit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-sm"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QuickActions ─────────────────────────────────────────────────────────────

type QuickActionsProps = {
  active: string | null;
  onSelect: (action: string, state?: string) => void;
  pinnedCount: number;
};

function QuickActions({ active, onSelect, pinnedCount }: QuickActionsProps) {
  const [stateOpen, setStateOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setStateOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const base = "rounded-full border text-xs font-medium px-3.5 py-1.5 transition-all flex items-center gap-1.5";
  const normal = "border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:border-white/30 hover:text-white";
  const activeStyle = "bg-white/25 border-white/40 text-white";
  const disabled = "border-white/10 bg-white/5 text-white/30 cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-3 max-w-2xl w-full">
      <button className={cn(base, active === "top" ? activeStyle : normal)} onClick={() => onSelect("top")}>
        <Trophy className="h-3 w-3" /> Top Performing Sellers
      </button>
      <button className={cn(base, active === "risk" ? activeStyle : normal)} onClick={() => onSelect("risk")}>
        <Shield className="h-3 w-3" /> Lowest Risk Institutions
      </button>
      <button className={cn(base, active === "new" ? activeStyle : normal)} onClick={() => onSelect("new")}>
        <Sparkles className="h-3 w-3" /> New Loan Listings
      </button>

      <div className="relative" ref={dropRef}>
        <button
          className={cn(base, active === "state" ? activeStyle : normal)}
          onClick={() => setStateOpen((v) => !v)}
        >
          <MapPin className="h-3 w-3" /> State Leaders
          <ChevronDown className={cn("h-3 w-3 transition-transform", stateOpen && "rotate-180")} />
        </button>
        {stateOpen && (
          <div className="absolute bottom-full mb-2 left-0 z-50 w-44 rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="max-h-48 overflow-y-auto p-1">
              {ALL_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => { onSelect("state", st); setStateOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        className={cn(base, pinnedCount >= 2 ? (active === "compare" ? activeStyle : normal) : disabled)}
        onClick={() => pinnedCount >= 2 && onSelect("compare")}
        title={pinnedCount < 2 ? "Pin 2+ institutions to compare" : "Compare selected"}
      >
        <Scale className="h-3 w-3" />
        Compare My Selected {pinnedCount >= 2 && `(${pinnedCount})`}
      </button>
    </div>
  );
}

// ─── CohiResponseCard ─────────────────────────────────────────────────────────

function CohiResponseCard({ answer }: { answer: string }) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 border-l-4 border-l-indigo-500 p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4 text-indigo-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-indigo-700">Cohi</span>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600">AI Analyst</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{answer}</p>
      <p className="mt-2 text-[11px] text-slate-400">Based on 7,052 real loans · Powered by Cohi AI</p>
    </div>
  );
}

// ─── ProductMiniBar ───────────────────────────────────────────────────────────

function ProductMiniBar({ products, color }: { products: InstitutionResult["products"]; color: "sky" | "amber" | "rose" }) {
  const total = products.p30 + products.p15 + products.pArm;
  const c = COLOR_MAP[color];
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
      <div className={cn(c.bar, "h-full")} style={{ width: pct(products.p30, total) }} title={`30FRM: ${pct(products.p30, total)}`} />
      <div className="h-full bg-slate-300" style={{ width: pct(products.p15, total) }} title={`15FRM: ${pct(products.p15, total)}`} />
      {products.pArm > 0 && (
        <div className="h-full bg-slate-400" style={{ width: pct(products.pArm, total) }} title={`ARM: ${pct(products.pArm, total)}`} />
      )}
    </div>
  );
}

// ─── InstitutionCardList ──────────────────────────────────────────────────────

function InstitutionCardList({
  inst, pinned, onPin, onView,
}: { inst: InstitutionResult; pinned: boolean; onPin: () => void; onView: () => void }) {
  const c = COLOR_MAP[inst.color];
  return (
    <div className={cn("rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4", c.border)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-sm shadow-sm", c.accent)}>
          {inst.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{inst.name}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.light, c.text)}>Loan Seller</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <Stat label="Loans" value={inst.count.toLocaleString()} />
            <Stat label="UPB" value={fmt(inst.upb)} />
            <Stat label="WAC" value={inst.waRate.toFixed(2) + "%"} />
            <Stat label="WA FICO" value={inst.waFico.toString()} />
            <Stat label="WA LTV" value={inst.waLtv.toFixed(1) + "%"} />
          </div>
          <ProductMiniBar products={inst.products} color={inst.color} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPin}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              pinned ? cn(c.accent, "text-white border-transparent shadow-sm") : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
            )}
            title={pinned ? "Unpin" : "Pin to compare"}
          >
            <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
          </button>
          <button
            onClick={onView}
            className={cn("flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm", c.border, c.text, c.light)}
          >
            <Eye className="h-3 w-3" /> View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs text-slate-500">
      <span className="text-slate-400">{label} </span>
      <span className="font-semibold text-slate-700">{value}</span>
    </span>
  );
}

// ─── InstitutionCardGrid ──────────────────────────────────────────────────────

function InstitutionCardGrid({
  inst, pinned, onPin, onView,
}: { inst: InstitutionResult; pinned: boolean; onPin: () => void; onView: () => void }) {
  const c = COLOR_MAP[inst.color];
  return (
    <div className={cn("rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden w-72 flex flex-col", c.border)}>
      <div className={cn("px-4 py-3", c.accent)}>
        <span className="text-white font-semibold text-sm">{inst.name}</span>
        <div className="text-white/70 text-[11px]">Loan Seller</div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-slate-100 flex-1">
        {[
          { label: "Loans", value: inst.count.toLocaleString() },
          { label: "UPB", value: fmt(inst.upb) },
          { label: "WAC", value: inst.waRate.toFixed(2) + "%" },
          { label: "WA FICO", value: inst.waFico.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-3 py-2.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
            <div className="font-bold text-slate-800 text-sm tabular-nums">{value}</div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-2 pt-2 bg-white">
        <ProductMiniBar products={inst.products} color={inst.color} />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onPin}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
              pinned ? cn(c.accent, "text-white border-transparent") : "border-slate-200 text-slate-400 hover:text-slate-600",
            )}
          >
            <Pin className={cn("h-3 w-3", pinned && "fill-current")} />
          </button>
          <button
            onClick={onView}
            className={cn("flex-1 flex items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium transition-all", c.border, c.text, c.light)}
          >
            <Eye className="h-3 w-3" /> View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ResultsPanel ─────────────────────────────────────────────────────────────

type ResultsPanelProps = {
  results: InstitutionResult[];
  viewMode: "list" | "grid";
  onViewModeChange: (m: "list" | "grid") => void;
  cohiResponse: string | null;
  isLoading: boolean;
  pinned: Set<string>;
  onPin: (id: string) => void;
  onView: (inst: InstitutionResult) => void;
};

function ResultsPanel({ results, viewMode, onViewModeChange, cohiResponse, isLoading, pinned, onPin, onView }: ResultsPanelProps) {
  const hasContent = isLoading || cohiResponse || results.length > 0;
  if (!hasContent) return null;

  return (
    <div className="max-w-2xl w-full mb-3 animate-fade-in-up">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-500">
            {isLoading ? "Searching…" : `${results.length} institution${results.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewModeChange("list")}
              className={cn("flex h-6 w-6 items-center justify-center rounded transition-colors", viewMode === "list" ? "bg-slate-200 text-slate-700" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn("flex h-6 w-6 items-center justify-center rounded transition-colors", viewMode === "grid" ? "bg-slate-200 text-slate-700" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <div className="flex items-center gap-3 px-3 py-4">
              <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-sm text-slate-500">Cohi is thinking…</span>
            </div>
          )}
          {cohiResponse && <CohiResponseCard answer={cohiResponse} />}
          {viewMode === "list" ? (
            results.map((inst) => (
              <InstitutionCardList
                key={inst.id} inst={inst}
                pinned={pinned.has(inst.id)}
                onPin={() => onPin(inst.id)}
                onView={() => onView(inst)}
              />
            ))
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {results.map((inst) => (
                <InstitutionCardGrid
                  key={inst.id} inst={inst}
                  pinned={pinned.has(inst.id)}
                  onPin={() => onPin(inst.id)}
                  onView={() => onView(inst)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── InstitutionCompareModal ──────────────────────────────────────────────────

function InstitutionCompareModal({
  institutions, onClose,
}: { institutions: InstitutionResult[]; onClose: () => void }) {
  const rows: { label: string; getValue: (i: InstitutionResult) => string; better: "high" | "low" | null }[] = [
    { label: "Loan Count",   getValue: (i) => i.count.toLocaleString(),         better: "high" },
    { label: "Total UPB",   getValue: (i) => fmt(i.upb),                        better: "high" },
    { label: "WA Coupon",   getValue: (i) => i.waRate.toFixed(2) + "%",         better: "low"  },
    { label: "WA FICO",     getValue: (i) => i.waFico.toString(),                better: "high" },
    { label: "WA LTV",      getValue: (i) => i.waLtv.toFixed(1) + "%",          better: "low"  },
    { label: "WA DTI",      getValue: (i) => i.waDti.toFixed(1) + "%",          better: "low"  },
    { label: "Avg Balance", getValue: (i) => `$${i.avgBal.toLocaleString()}`,    better: null   },
    { label: "30FRM %",     getValue: (i) => pct(i.products.p30, i.count),      better: null   },
    { label: "15FRM %",     getValue: (i) => pct(i.products.p15, i.count),      better: null   },
    { label: "Available %", getValue: (i) => pct(i.status.avail, i.count),      better: "high" },
    { label: "Sold %",      getValue: (i) => pct(i.status.sold, i.count),       better: null   },
    { label: "Top State",   getValue: (i) => i.topStates[0]?.s ?? "—",          better: null   },
  ];

  function numericVal(row: typeof rows[0], inst: InstitutionResult): number {
    const raw = row.getValue(inst);
    return parseFloat(raw.replace(/[$%,BMK]/g, "")) || 0;
  }

  function highlight(row: typeof rows[0], inst: InstitutionResult): string {
    if (!row.better) return "";
    const vals = institutions.map((i) => numericVal(row, i));
    const v = numericVal(row, inst);
    const best = row.better === "high" ? Math.max(...vals) : Math.min(...vals);
    const worst = row.better === "high" ? Math.min(...vals) : Math.max(...vals);
    if (v === best && vals.filter((x) => x === best).length === 1) return "bg-emerald-50 text-emerald-700 font-semibold";
    if (v === worst && vals.filter((x) => x === worst).length === 1) return "bg-rose-50 text-rose-700";
    return "";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800 text-lg">Institution Comparison</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-36">Metric</th>
                {institutions.map((inst) => {
                  const c = COLOR_MAP[inst.color];
                  return (
                    <th key={inst.id} className="text-left px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full", c.accent)} />
                        <span className="font-semibold text-slate-800">{inst.name}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.label} className={cn("border-b border-slate-100", ri % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                  <td className="px-4 py-2.5 text-xs font-medium text-slate-500">{row.label}</td>
                  {institutions.map((inst) => (
                    <td key={inst.id} className={cn("px-4 py-2.5 text-sm tabular-nums rounded", highlight(row, inst))}>
                      {row.getValue(inst)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400">
          Green = best · Red = worst · Based on 7,052 real loans
        </div>
      </div>
    </div>
  );
}

// ─── PoolsManager ─────────────────────────────────────────────────────────────

function PoolsManager({ onClose }: { onClose: () => void }) {
  const { pools, renamePool, deletePool } = usePools();
  const [editing, setEditing] = useState<Record<string, string>>({});

  return (
    <div className="absolute bottom-full mb-2 right-0 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-slate-800 text-sm">Loan Pools</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">{pools.length}</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-200 text-slate-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
        {pools.length === 0 && (
          <p className="text-center py-6 text-sm text-slate-400">No loan pools saved yet</p>
        )}
        {pools.map((pool) => (
          <div key={pool.id} className="rounded-xl border border-slate-200 p-3 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
              {editing[pool.id] !== undefined ? (
                <input
                  autoFocus
                  value={editing[pool.id]}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [pool.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renamePool(pool.id, editing[pool.id] || pool.name);
                      setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; });
                    }
                    if (e.key === "Escape") {
                      setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; });
                    }
                  }}
                  onBlur={() => {
                    renamePool(pool.id, editing[pool.id] || pool.name);
                    setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; });
                  }}
                  className="flex-1 text-sm font-semibold text-slate-800 border-b border-indigo-300 outline-none bg-transparent"
                />
              ) : (
                <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{pool.name}</span>
              )}
              <div className="flex items-center gap-1">
                {editing[pool.id] !== undefined ? (
                  <button
                    onClick={() => {
                      renamePool(pool.id, editing[pool.id] || pool.name);
                      setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; });
                    }}
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing((prev) => ({ ...prev, [pool.id]: pool.name }))}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => deletePool(pool.id)}
                  className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {pool.institutionIds.map((id) => {
                const inst = INSTITUTIONS.find((i) => i.id === id);
                if (!inst) return null;
                const c = COLOR_MAP[inst.color];
                return (
                  <span key={id} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.light, c.text)}>
                    {inst.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CompareBar ───────────────────────────────────────────────────────────────

function CompareBar({
  pinnedIds, onCompare, onClear, onSavePool, onOpenPools, poolCount,
}: {
  pinnedIds: string[];
  onCompare: () => void;
  onClear: () => void;
  onSavePool: () => void;
  onOpenPools: () => void;
  poolCount: number;
}) {
  const [poolsOpen, setPoolsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <span className="text-sm font-medium text-slate-700">
        {pinnedIds.length} institution{pinnedIds.length !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-1.5">
        {pinnedIds.map((id) => {
          const inst = INSTITUTIONS.find((i) => i.id === id);
          if (!inst) return null;
          const c = COLOR_MAP[inst.color];
          return (
            <span key={id} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", c.light, c.text)}>
              {inst.name}
            </span>
          );
        })}
      </div>
      <div className="h-5 w-px bg-slate-200" />
      <button
        onClick={onCompare}
        className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
      >
        <ArrowUpRight className="h-3.5 w-3.5" /> Compare
      </button>
      <button
        onClick={onSavePool}
        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        <Plus className="h-3 w-3" /> Save as Loan Pool
      </button>
      <div className="relative">
        <button
          onClick={() => { setPoolsOpen((v) => !v); onOpenPools(); }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Layers className="h-3 w-3" /> Loan Pools {poolCount > 0 && `(${poolCount})`}
        </button>
        {poolsOpen && <PoolsManager onClose={() => setPoolsOpen(false)} />}
      </div>
      <button
        onClick={onClear}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstitutionResult[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [cohiMode, setCohiMode] = useState(false);
  const [cohiResponse, setCohiResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [modalInstitution, setModalInstitution] = useState<InstitutionResult | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const { pools, createPool } = usePools();
  const recognitionRef = useRef<any>(null);

  const handleSearch = useCallback(async (q: string, mode = cohiMode) => {
    if (!q.trim()) return;
    setCohiResponse(null);
    setActiveAction(null);

    if (mode) {
      setIsLoading(true);
      setResults([]);
      try {
        const res = await fetch("/api/cohi/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        setCohiResponse(data.answer);
        const lower = q.toLowerCase();
        const matched = INSTITUTIONS.filter((i) => lower.includes(i.name.toLowerCase()) || lower.includes(i.id));
        setResults(matched.length > 0 ? matched : INSTITUTIONS);
      } catch {
        setCohiResponse("Sorry, I couldn't connect to Cohi right now. Here's a portfolio summary: 7,052 loans, $1.86B UPB, WA FICO 744, WA Rate 3.50%, WA LTV 71.42%.");
        setResults(INSTITUTIONS);
      } finally {
        setIsLoading(false);
      }
    } else {
      const lower = q.toLowerCase();
      const matched = INSTITUTIONS.filter((i) =>
        i.name.toLowerCase().includes(lower) ||
        i.id.includes(lower) ||
        i.topStates.some((st) => st.s.toLowerCase() === lower)
      );
      setResults(matched.length > 0 ? matched : INSTITUTIONS);
    }
  }, [cohiMode]);

  const handleSubmit = useCallback(() => handleSearch(query), [query, handleSearch]);

  const handleQuickAction = useCallback((action: string, state?: string) => {
    setActiveAction(action);
    setCohiResponse(null);
    setQuery("");

    if (action === "top") {
      setResults([...INSTITUTIONS].sort((a, b) => b.waFico - a.waFico || a.waRate - b.waRate));
    } else if (action === "risk") {
      setResults([...INSTITUTIONS].sort((a, b) => a.waLtv - b.waLtv));
    } else if (action === "new") {
      const ranked = INSTITUTIONS.map((i) => ({
        ...i,
        count: Math.round(i.count * 0.28),
        upb: Math.round(i.upb * 0.28),
      }));
      setResults(ranked.sort((a, b) => b.count - a.count));
    } else if (action === "state" && state) {
      const ranked = [...INSTITUTIONS]
        .map((i) => {
          const stateCount = (SELLER_STATE_COUNTS[i.id] ?? {})[state] ?? 0;
          return { ...i, _stateCount: stateCount };
        })
        .sort((a, b) => (b as any)._stateCount - (a as any)._stateCount);
      setResults(ranked);
    } else if (action === "compare") {
      setCompareOpen(true);
    }
  }, []);

  const handlePin = useCallback((id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition is not supported in this browser."); return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSearch(transcript, cohiMode);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  }, [isListening, cohiMode, handleSearch]);

  const pinnedIds = Array.from(pinned);
  const pinnedInstitutions = INSTITUTIONS.filter((i) => pinned.has(i.id));

  return (
    <section className="flex flex-col items-center justify-end pb-16 flex-1 relative px-4 pt-20">
      <ResultsPanel
        results={results}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cohiResponse={cohiResponse}
        isLoading={isLoading}
        pinned={pinned}
        onPin={handlePin}
        onView={setModalInstitution}
      />

      <QuickActions
        active={activeAction}
        onSelect={handleQuickAction}
        pinnedCount={pinnedIds.length}
      />

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        cohiMode={cohiMode}
        onCohiToggle={() => setCohiMode((v) => !v)}
        isListening={isListening}
        onMicToggle={handleMicToggle}
        isLoading={isLoading}
      />

      <p className="mt-3 text-xs text-white/40">
        Search loan sellers, states, or ask Cohi a question
      </p>

      {pinnedIds.length >= 2 && (
        <CompareBar
          pinnedIds={pinnedIds}
          onCompare={() => setCompareOpen(true)}
          onClear={() => setPinned(new Set())}
          onSavePool={() => createPool(pinnedIds)}
          onOpenPools={() => {}}
          poolCount={pools.length}
        />
      )}

      {modalInstitution && (
        <LenderDrilldownModal
          lender={modalInstitution.name}
          onClose={() => setModalInstitution(null)}
        />
      )}

      {compareOpen && pinnedInstitutions.length >= 2 && (
        <InstitutionCompareModal
          institutions={pinnedInstitutions}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </section>
  );
}

// ─── Landing (default export) ─────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 flex flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(14,165,233,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(99,102,241,0.10) 0%, transparent 60%)",
        }}
      />
      <LandingNav />
      <HeroSection />
    </div>
  );
}
