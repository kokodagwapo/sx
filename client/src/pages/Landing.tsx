import { useState, useCallback, useRef, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Mic, MicOff, Bot, ArrowRight, LayoutList, LayoutGrid,
  Pin, Eye, X, ChevronDown, Trophy, Shield, Sparkles, MapPin,
  Scale, Pencil, Trash2, Check, Plus, ArrowUpRight, Layers,
  Building2, Moon, Sun, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LenderDrilldownModal } from "@/components/buyers/LenderDrilldownModal";
import { BuyerModal } from "@/components/buyers/BuyerInfoCard";
import { usePools } from "@/context/PoolsContext";
import realStats from "@/data/real/realStats.json";

// ─── Theme Context ────────────────────────────────────────────────────────────

const ThemeCtx = createContext<{ isDark: boolean; toggle: () => void }>({ isDark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ─── Types ────────────────────────────────────────────────────────────────────

type BuyerType = "bank" | "credit_union" | "insurance" | "gse";
type FilterCategory = "all" | "seller" | "bank" | "credit_union" | "insurance" | "gse";

type InstitutionResult = {
  id: string;
  name: string;
  kind: "seller" | "buyer";
  buyerId?: string;
  buyerType?: BuyerType;
  color: "sky" | "amber" | "rose" | "indigo" | "violet" | "emerald";
  institutionType?: string;
  hq?: string;
  description?: string;
  assets?: number;
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
};

// ─── Institution data ─────────────────────────────────────────────────────────

const INSTITUTIONS: InstitutionResult[] = [
  {
    id: "provident", name: "Provident", kind: "seller", color: "sky",
    count: 2452, upb: 711354965, waRate: 3.2781, waFico: 769, waLtv: 61.16, waDti: 31.27, avgBal: 290112,
    products: { p30: 1396, p15: 986, pArm: 70 },
    status: { avail: 1323, alloc: 522, comm: 327, sold: 280 },
    topStates: [{ s: "CA", c: 773 }, { s: "UT", c: 195 }, { s: "WA", c: 176 }, { s: "TX", c: 168 }, { s: "CO", c: 153 }],
  },
  {
    id: "stonegate", name: "Stonegate", kind: "seller", color: "amber",
    count: 963, upb: 209093793, waRate: 3.7413, waFico: 716, waLtv: 87.87, waDti: 39.21, avgBal: 217128,
    products: { p30: 901, p15: 62, pArm: 0 },
    status: { avail: 516, alloc: 202, comm: 123, sold: 122 },
    topStates: [{ s: "CA", c: 124 }, { s: "IL", c: 101 }, { s: "OH", c: 74 }, { s: "NJ", c: 60 }, { s: "PA", c: 47 }],
  },
  {
    id: "new-penn-financial", name: "New Penn Financial", kind: "seller", color: "rose",
    count: 3637, upb: 940884877, waRate: 3.621, waFico: 732, waLtv: 75.52, waDti: 38.0, avgBal: 258698,
    products: { p30: 3210, p15: 403, pArm: 24 },
    status: { avail: 2010, alloc: 759, comm: 448, sold: 420 },
    topStates: [{ s: "CA", c: 552 }, { s: "FL", c: 310 }, { s: "NY", c: 276 }, { s: "GA", c: 272 }, { s: "PA", c: 265 }],
  },
];

function mkBuyer(
  id: string, name: string, buyerType: BuyerType,
  color: InstitutionResult["color"], institutionType: string,
  hq: string, description: string, assets: number,
): InstitutionResult {
  return {
    id, name, kind: "buyer", buyerId: id, buyerType, color,
    institutionType, hq, description, assets,
    count: 0, upb: 0, waRate: 0, waFico: 0, waLtv: 0, waDti: 0, avgBal: 0,
    products: { p30: 0, p15: 0, pArm: 0 },
    status: { avail: 0, alloc: 0, comm: 0, sold: 0 },
    topStates: [],
  };
}

const BUYERS: InstitutionResult[] = [
  mkBuyer("BNK-001", "JPMorgan Chase Bank, NA",    "bank",         "sky",     "FDIC-Insured Bank",     "Columbus, OH",       "Largest U.S. bank by total assets; leading whole-loan and MBS buyer with global capital markets presence.",                          3_900_000_000_000),
  mkBuyer("BNK-002", "Bank of America, NA",         "bank",         "indigo",  "FDIC-Insured Bank",     "Charlotte, NC",      "Second-largest U.S. bank; active acquirer of residential mortgage pools and GSE-eligible collateral.",                             3_300_000_000_000),
  mkBuyer("BNK-003", "Wells Fargo Bank, NA",        "bank",         "violet",  "FDIC-Insured Bank",     "Sioux Falls, SD",    "Top-4 U.S. bank; historically one of the largest mortgage servicers and whole-loan buyers in the country.",                        1_900_000_000_000),
  mkBuyer("BNK-004", "Citibank, NA",                "bank",         "emerald", "FDIC-Insured Bank",     "New York, NY",       "Third-largest U.S. bank; major residential mortgage investor and whole-loan acquirer with global presence.",                       1_700_000_000_000),
  mkBuyer("BNK-005", "U.S. Bank, NA",               "bank",         "amber",   "FDIC-Insured Bank",     "Cincinnati, OH",     "Fifth-largest U.S. bank; active portfolio lender and mortgage-backed securities investor.",                                       680_000_000_000),
  mkBuyer("BNK-006", "PNC Bank, NA",                "bank",         "rose",    "FDIC-Insured Bank",     "Pittsburgh, PA",     "Major regional bank; significant residential mortgage portfolio and whole-loan acquisition program.",                              560_000_000_000),
  mkBuyer("BNK-007", "Truist Bank",                 "bank",         "sky",     "FDIC-Insured Bank",     "Charlotte, NC",      "Top-6 U.S. bank formed from BB&T/SunTrust merger; active in Southeast mortgage markets.",                                        535_000_000_000),
  mkBuyer("BNK-008", "Capital One, NA",             "bank",         "indigo",  "FDIC-Insured Bank",     "McLean, VA",         "Large diversified bank; selectively acquires residential mortgage loans to complement retail deposits.",                           465_000_000_000),
  mkBuyer("BNK-009", "TD Bank, NA",                 "bank",         "violet",  "FDIC-Insured Bank",     "Cherry Hill, NJ",    "U.S. subsidiary of TD Bank Group; major East Coast mortgage lender and portfolio investor.",                                      390_000_000_000),
  mkBuyer("BNK-010", "Goldman Sachs Bank USA",      "bank",         "emerald", "FDIC-Insured Bank",     "Salt Lake City, UT", "Investment bank FDIC subsidiary; invests in mortgage assets and MBS through its institutional banking platform.",                  595_000_000_000),
  mkBuyer("BNK-011", "Citizens Bank, NA",           "bank",         "amber",   "FDIC-Insured Bank",     "Providence, RI",     "Major Northeast regional bank; active residential mortgage lender and whole-loan portfolio buyer.",                               225_000_000_000),
  mkBuyer("BNK-012", "Regions Bank",                "bank",         "rose",    "FDIC-Insured Bank",     "Birmingham, AL",     "Large Southeast regional bank; purchases residential mortgage pools to serve community lending needs.",                           160_000_000_000),
  mkBuyer("BNK-013", "Fifth Third Bank",            "bank",         "sky",     "FDIC-Insured Bank",     "Cincinnati, OH",     "Midwest-headquartered bank; active whole-loan buyer with focus on conforming and government mortgages.",                          215_000_000_000),
  mkBuyer("BNK-014", "KeyBank, NA",                 "bank",         "indigo",  "FDIC-Insured Bank",     "Cleveland, OH",      "Top-15 U.S. bank; acquires residential mortgage pools through its community banking platform.",                                   190_000_000_000),
  mkBuyer("BNK-015", "Flagstar Bank, NA",           "bank",         "violet",  "FDIC-Insured Bank",     "Hicksville, NY",     "Specialty mortgage bank; one of the largest non-bank mortgage servicers and a leading whole-loan buyer.",                         115_000_000_000),
  mkBuyer("CU-001",  "PenFed Credit Union",         "credit_union", "emerald", "Federal Credit Union",  "McLean, VA",         "Largest federal credit union by assets; active buyer of conforming mortgage pools with competitive pricing.",                      38_000_000_000),
  mkBuyer("CU-002",  "Navy Federal Credit Union",   "credit_union", "amber",   "Federal Credit Union",  "Vienna, VA",         "Largest U.S. federal credit union; major mortgage acquirer serving military and defense community.",                              170_000_000_000),
  mkBuyer("CU-003",  "USAA Federal Savings Bank",   "bank",         "rose",    "FDIC-Insured Bank",     "San Antonio, TX",    "Bank serving U.S. military members and their families; major residential mortgage portfolio investor.",                          125_000_000_000),
  mkBuyer("CU-004",  "Boeing Employees CU (BECU)",  "credit_union", "sky",     "State Credit Union",    "Tukwila, WA",        "Large Pacific Northwest credit union; acquires residential mortgage pools for member benefit.",                                    30_000_000_000),
  mkBuyer("INS-001", "Pacific Life Insurance Co.",  "insurance",    "indigo",  "Insurance Company",     "Newport Beach, CA",  "Major life insurance carrier; invests in high-quality MBS and whole loans for long-duration asset-liability management.",          150_000_000_000),
  mkBuyer("INS-002", "New York Life Insurance Co.", "insurance",    "violet",  "Insurance Company",     "New York, NY",       "Largest mutual life insurer in the U.S.; invests in residential mortgages for long-duration yield matching.",                     600_000_000_000),
  mkBuyer("INS-003", "MetLife Insurance",           "insurance",    "emerald", "Insurance Company",     "New York, NY",       "Global life insurer; invests in residential MBS and whole loans as part of its fixed-income strategy.",                           730_000_000_000),
  mkBuyer("INS-004", "Prudential Financial",        "insurance",    "amber",   "Insurance Company",     "Newark, NJ",         "Major life and annuity insurer; allocates to residential mortgage investments for liability-duration matching.",                   1_500_000_000_000),
  mkBuyer("INV-001", "BlackRock Mortgage Strategies","gse",         "rose",    "Investment Manager",    "New York, NY",       "World's largest asset manager; operates multiple mortgage-focused funds acquiring whole loans and MBS.",                         10_000_000_000_000),
  mkBuyer("INV-002", "TIAA Financial Services",     "insurance",    "sky",     "Insurance Company",     "New York, NY",       "Teacher Insurance and Annuity Association; long-duration fixed income investor including residential mortgage assets.",           1_200_000_000_000),
];

const ALL_INSTITUTIONS: InstitutionResult[] = [...INSTITUTIONS, ...BUYERS];

const SELLER_STATE_COUNTS: Record<string, Record<string, number>> = {
  provident:           { CA: 773, UT: 195, WA: 176, TX: 168, CO: 153, AZ: 138, ID: 95, NV: 78, OR: 61, MT: 32 },
  stonegate:           { CA: 124, IL: 101, OH: 74,  NJ: 60,  PA: 47,  NY: 44,  MI: 38, IN: 27, MO: 22, WI: 18 },
  "new-penn-financial":{ CA: 552, FL: 310, NY: 276, GA: 272, PA: 265, TX: 187, NJ: 163, VA: 148, MD: 121, NC: 98 },
};

const ALL_STATES = Object.keys((realStats as any).byState ?? {}).sort();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  sky:     { accent: "bg-sky-600",     light: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     bar: "bg-sky-500",     leftBorder: "border-l-sky-500"     },
  amber:   { accent: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   bar: "bg-amber-400",   leftBorder: "border-l-amber-400"   },
  rose:    { accent: "bg-rose-600",    light: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    bar: "bg-rose-500",    leftBorder: "border-l-rose-500"    },
  indigo:  { accent: "bg-indigo-600",  light: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  bar: "bg-indigo-500",  leftBorder: "border-l-indigo-500"  },
  violet:  { accent: "bg-violet-600",  light: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  bar: "bg-violet-500",  leftBorder: "border-l-violet-500"  },
  emerald: { accent: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500", leftBorder: "border-l-emerald-500" },
};

const PAGE_SIZE = 20;

const FILTER_CHIPS: { id: FilterCategory; label: string }[] = [
  { id: "all",          label: "All"           },
  { id: "seller",       label: "Loan Sellers"  },
  { id: "bank",         label: "Banks"         },
  { id: "credit_union", label: "Credit Unions" },
  { id: "insurance",    label: "Insurance"     },
  { id: "gse",          label: "Investment"    },
];

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtAssets(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(0)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}

function pct(n: number, total: number) { return total ? ((n / total) * 100).toFixed(0) + "%" : "0%"; }

function applyFilter(items: InstitutionResult[], filter: FilterCategory): InstitutionResult[] {
  if (filter === "all") return items;
  if (filter === "seller") return items.filter((i) => i.kind === "seller");
  return items.filter((i) => i.kind === "buyer" && i.buyerType === filter);
}

// ─── LandingNav ───────────────────────────────────────────────────────────────

function LandingNav() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md border-b transition-colors",
      isDark ? "bg-white/5 border-white/10" : "bg-white/90 border-slate-200",
    )}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
          <span className="text-[11px] font-black text-white tracking-tight">SX</span>
        </div>
        <div>
          <span className={cn("font-semibold text-sm tracking-tight", isDark ? "text-white" : "text-slate-900")}>SprinkleX</span>
          <span className={cn("ml-2 text-xs", isDark ? "text-white/40" : "text-slate-400")}>Loan Portfolio Analytics</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm", isDark ? "text-white/60" : "text-slate-500")}>Hey, Maylin 👋</span>
        <button
          onClick={toggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            isDark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
          )}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
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
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") onSubmit(); };

  return (
    <div className="relative max-w-2xl w-full">
      <div className={cn(
        "flex items-center gap-2 rounded-2xl px-4 py-3 shadow-[0_8px_60px_rgba(0,0,0,0.3)] backdrop-blur-sm border transition-all duration-200 bg-white",
        cohiMode ? "ring-2 ring-indigo-500/40 border-indigo-200" : "border-white/20",
      )}>
        {cohiMode
          ? <Bot className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          : <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={cohiMode ? "Ask Cohi about the portfolio..." : "Search by name, type, state, HQ city..."}
          className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
        />
        {isLoading && <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex-shrink-0" />}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMicToggle}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
              isListening ? "bg-red-500 text-white ring-2 ring-red-400 ring-offset-1" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            )}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            onClick={onCohiToggle}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
              cohiMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            )}
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

function QuickActions({ active, onSelect, pinnedCount }: { active: string | null; onSelect: (action: string, state?: string) => void; pinnedCount: number }) {
  const { isDark } = useTheme();
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
  const normal = isDark
    ? "border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:border-white/30 hover:text-white"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm";
  const activeStyle = isDark ? "bg-white/25 border-white/40 text-white" : "bg-slate-800 border-slate-800 text-white shadow-sm";
  const disabled = isDark ? "border-white/10 bg-white/5 text-white/30 cursor-not-allowed" : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed";

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

function ProductMiniBar({ products, color }: { products: InstitutionResult["products"]; color: InstitutionResult["color"] }) {
  const { isDark } = useTheme();
  const total = products.p30 + products.p15 + products.pArm;
  const c = COLOR_MAP[color];
  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full mt-2", isDark ? "bg-white/15" : "bg-slate-100")}>
      <div className={cn(c.bar, "h-full")} style={{ width: pct(products.p30, total) }} title={`30FRM: ${pct(products.p30, total)}`} />
      <div className={cn("h-full", isDark ? "bg-white/30" : "bg-slate-300")} style={{ width: pct(products.p15, total) }} title={`15FRM: ${pct(products.p15, total)}`} />
      {products.pArm > 0 && (
        <div className={cn("h-full", isDark ? "bg-white/20" : "bg-slate-400")} style={{ width: pct(products.pArm, total) }} title={`ARM: ${pct(products.pArm, total)}`} />
      )}
    </div>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  const { isDark } = useTheme();
  return (
    <span className="text-xs">
      <span className={isDark ? "text-white/40" : "text-slate-400"}>{label} </span>
      <span className={cn("font-semibold", isDark ? "text-white/80" : "text-slate-700")}>{value}</span>
    </span>
  );
}

// ─── InstitutionCardList ──────────────────────────────────────────────────────

function InstitutionCardList({
  inst, pinned, onPin, onView,
}: { inst: InstitutionResult; pinned: boolean; onPin: () => void; onView: () => void }) {
  const { isDark } = useTheme();
  const c = COLOR_MAP[inst.color];
  const isBuyer = inst.kind === "buyer";

  return (
    <div className={cn(
      "transition-all p-4",
      isDark
        ? cn("rounded-2xl bg-white/10 hover:bg-white/[0.15] backdrop-blur-sm border-l-4", c.leftBorder)
        : cn("rounded-xl bg-white border shadow-sm hover:shadow-md", c.border),
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-sm shadow-sm", c.accent)}>
          {isBuyer ? <Building2 className="h-4 w-4" /> : inst.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-semibold text-sm", isDark ? "text-white" : "text-slate-800")}>{inst.name}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.light, c.text)}>
              {isBuyer ? (inst.institutionType ?? "Buyer") : "Loan Seller"}
            </span>
          </div>
          {isBuyer ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <Stat label="Total Assets" value={fmtAssets(inst.assets ?? 0)} />
              <Stat label="HQ" value={inst.hq ?? "—"} />
              <span className={cn("text-[11px] truncate max-w-xs", isDark ? "text-white/40" : "text-slate-400")}>{inst.description}</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <Stat label="Loans" value={inst.count.toLocaleString()} />
                <Stat label="UPB" value={fmt(inst.upb)} />
                <Stat label="WAC" value={inst.waRate.toFixed(2) + "%"} />
                <Stat label="WA FICO" value={inst.waFico.toString()} />
                <Stat label="WA LTV" value={inst.waLtv.toFixed(1) + "%"} />
              </div>
              <ProductMiniBar products={inst.products} color={inst.color} />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPin}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              pinned
                ? cn(c.accent, "text-white border-transparent shadow-sm")
                : isDark
                  ? "border-white/20 text-white/40 hover:border-white/40 hover:text-white/70"
                  : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
            )}
            title={pinned ? "Unpin" : "Pin to compare"}
          >
            <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
          </button>
          <button
            onClick={onView}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              isDark
                ? "bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white"
                : cn("hover:shadow-sm", c.border, c.text, c.light),
            )}
          >
            <Eye className="h-3 w-3" /> View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── InstitutionCardGrid ──────────────────────────────────────────────────────

function InstitutionCardGrid({
  inst, pinned, onPin, onView,
}: { inst: InstitutionResult; pinned: boolean; onPin: () => void; onView: () => void }) {
  const { isDark } = useTheme();
  const c = COLOR_MAP[inst.color];
  const isBuyer = inst.kind === "buyer";
  const kpis = isBuyer
    ? [
        { label: "Total Assets", value: fmtAssets(inst.assets ?? 0) },
        { label: "Type",         value: inst.institutionType?.split(" ")[0] ?? "Buyer" },
        { label: "HQ City",      value: (inst.hq ?? "—").split(",")[0] },
        { label: "Status",       value: "Active" },
      ]
    : [
        { label: "Loans",   value: inst.count.toLocaleString() },
        { label: "UPB",     value: fmt(inst.upb) },
        { label: "WAC",     value: inst.waRate.toFixed(2) + "%" },
        { label: "WA FICO", value: inst.waFico.toString() },
      ];

  return (
    <div className={cn(
      "overflow-hidden w-64 flex flex-col transition-all",
      isDark
        ? "rounded-2xl bg-white/10 hover:bg-white/[0.15] backdrop-blur-sm"
        : cn("rounded-xl bg-white border shadow-sm hover:shadow-md", c.border),
    )}>
      <div className={cn("px-4 py-3", c.accent)}>
        <div className="flex items-center gap-2">
          {isBuyer && <Building2 className="h-3.5 w-3.5 text-white/80" />}
          <span className="text-white font-semibold text-sm truncate">{inst.name}</span>
        </div>
        <div className="text-white/70 text-[11px]">{isBuyer ? (inst.institutionType ?? "Buyer") : "Loan Seller"}</div>
      </div>
      <div className={cn("grid grid-cols-2 gap-px flex-1", isDark ? "bg-white/10" : "bg-slate-100")}>
        {kpis.map(({ label, value }) => (
          <div key={label} className={cn("px-3 py-2.5", isDark ? "bg-transparent" : "bg-white")}>
            <div className={cn("text-[10px] uppercase tracking-wide", isDark ? "text-white/40" : "text-slate-400")}>{label}</div>
            <div className={cn("font-bold text-sm tabular-nums truncate", isDark ? "text-white" : "text-slate-800")}>{value}</div>
          </div>
        ))}
      </div>
      {isBuyer && inst.description && (
        <div className={cn("px-3 pt-2", isDark ? "" : "bg-white")}>
          <p className={cn("text-[10px] leading-relaxed line-clamp-2", isDark ? "text-white/40" : "text-slate-400")}>{inst.description}</p>
        </div>
      )}
      {!isBuyer && (
        <div className={cn("px-3 pt-2", isDark ? "" : "bg-white")}>
          <ProductMiniBar products={inst.products} color={inst.color} />
        </div>
      )}
      <div className={cn("px-3 pb-3 pt-2", isDark ? "" : "bg-white")}>
        <div className="flex items-center gap-2">
          <button
            onClick={onPin}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
              pinned
                ? cn(c.accent, "text-white border-transparent")
                : isDark
                  ? "border-white/20 text-white/40 hover:text-white/70"
                  : "border-slate-200 text-slate-400 hover:text-slate-600",
            )}
          >
            <Pin className={cn("h-3 w-3", pinned && "fill-current")} />
          </button>
          <button
            onClick={onView}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium transition-all",
              isDark
                ? "bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white"
                : cn(c.border, c.text, c.light),
            )}
          >
            <Eye className="h-3 w-3" /> View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ResultsPanel (with filter tabs + pagination) ─────────────────────────────

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
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [page, setPage] = useState(0);

  useEffect(() => { setActiveFilter("all"); setPage(0); }, [results]);

  const counts: Record<FilterCategory, number> = {
    all:          results.length,
    seller:       results.filter((i) => i.kind === "seller").length,
    bank:         results.filter((i) => i.kind === "buyer" && i.buyerType === "bank").length,
    credit_union: results.filter((i) => i.kind === "buyer" && i.buyerType === "credit_union").length,
    insurance:    results.filter((i) => i.kind === "buyer" && i.buyerType === "insurance").length,
    gse:          results.filter((i) => i.kind === "buyer" && i.buyerType === "gse").length,
  };

  const filtered = applyFilter(results, activeFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFilterChange = (f: FilterCategory) => {
    setActiveFilter(f);
    setPage(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const rangeStart = filtered.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const hasContent = isLoading || cohiResponse || results.length > 0;
  if (!hasContent) return null;

  return (
    <div className="max-w-2xl w-full mb-3 animate-fade-in-up">
      <div className={cn(
        "rounded-2xl overflow-hidden",
        isDark ? "bg-white/[0.06] backdrop-blur-xl" : "bg-white shadow-xl border border-slate-100",
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-2.5 border-b",
          isDark ? "bg-white/[0.04] border-white/[0.08]" : "bg-slate-50/50 border-slate-100",
        )}>
          <span className={cn("text-xs font-medium", isDark ? "text-white/50" : "text-slate-500")}>
            {isLoading ? "Searching…" : filtered.length === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} institution${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-1">
            {[
              { mode: "list" as const, Icon: LayoutList },
              { mode: "grid" as const, Icon: LayoutGrid },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded transition-colors",
                  viewMode === mode
                    ? isDark ? "bg-white/15 text-white" : "bg-slate-200 text-slate-700"
                    : isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-600",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className={cn("flex gap-1.5 px-3 py-2 overflow-x-auto border-b scrollbar-none", isDark ? "border-white/[0.06]" : "border-slate-100")}>
          {FILTER_CHIPS.map(({ id, label }) => {
            const count = counts[id];
            const isActive = activeFilter === id;
            return (
              <button
                key={id}
                onClick={() => handleFilterChange(id)}
                className={cn(
                  "flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                    : isDark
                      ? "border-white/15 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                )}
              >
                {label} <span className={cn("ml-0.5", isActive ? "opacity-80" : "opacity-60")}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Card list */}
        <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <div className="flex items-center gap-3 px-3 py-4">
              <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className={cn("text-sm", isDark ? "text-white/60" : "text-slate-500")}>Cohi is thinking…</span>
            </div>
          )}
          {cohiResponse && <CohiResponseCard answer={cohiResponse} />}

          {filtered.length === 0 && !isLoading ? (
            <div className="py-8 text-center">
              <p className={cn("text-sm", isDark ? "text-white/40" : "text-slate-400")}>No institutions match this filter.</p>
            </div>
          ) : viewMode === "list" ? (
            pageItems.map((inst) => (
              <InstitutionCardList
                key={inst.id} inst={inst}
                pinned={pinned.has(inst.id)}
                onPin={() => onPin(inst.id)}
                onView={() => onView(inst)}
              />
            ))
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {pageItems.map((inst) => (
                <InstitutionCardGrid
                  key={inst.id} inst={inst}
                  pinned={pinned.has(inst.id)}
                  onPin={() => onPin(inst.id)}
                  onView={() => onView(inst)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={cn("flex items-center justify-center gap-1.5 pt-3 pb-1 border-t mt-2", isDark ? "border-white/[0.08]" : "border-slate-100")}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  page === 0
                    ? isDark ? "text-white/20 cursor-not-allowed" : "text-slate-200 cursor-not-allowed"
                    : isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100",
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={cn(
                    "h-7 min-w-[28px] px-2 rounded-lg text-xs font-medium transition-colors",
                    i === page
                      ? "bg-sky-600 text-white shadow-sm"
                      : isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100",
                  )}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages - 1}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  page === totalPages - 1
                    ? isDark ? "text-white/20 cursor-not-allowed" : "text-slate-200 cursor-not-allowed"
                    : isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100",
                )}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── InstitutionCompareModal ──────────────────────────────────────────────────

function InstitutionCompareModal({ institutions, onClose }: { institutions: InstitutionResult[]; onClose: () => void }) {
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
    return parseFloat(row.getValue(inst).replace(/[$%,BMK]/g, "")) || 0;
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
        {pools.length === 0 && <p className="text-center py-6 text-sm text-slate-400">No loan pools saved yet</p>}
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
                    if (e.key === "Enter") { renamePool(pool.id, editing[pool.id] || pool.name); setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; }); }
                    if (e.key === "Escape") { setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; }); }
                  }}
                  onBlur={() => { renamePool(pool.id, editing[pool.id] || pool.name); setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; }); }}
                  className="flex-1 text-sm font-semibold text-slate-800 border-b border-indigo-300 outline-none bg-transparent"
                />
              ) : (
                <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{pool.name}</span>
              )}
              <div className="flex items-center gap-1">
                {editing[pool.id] !== undefined ? (
                  <button onClick={() => { renamePool(pool.id, editing[pool.id] || pool.name); setEditing((prev) => { const n = { ...prev }; delete n[pool.id]; return n; }); }} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={() => setEditing((prev) => ({ ...prev, [pool.id]: pool.name }))} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                <button onClick={() => deletePool(pool.id)} className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {pool.institutionIds.map((id) => {
                const inst = ALL_INSTITUTIONS.find((i) => i.id === id);
                if (!inst) return null;
                const c = COLOR_MAP[inst.color];
                return <span key={id} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.light, c.text)}>{inst.name}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CompareBar ───────────────────────────────────────────────────────────────

function CompareBar({ pinnedIds, onCompare, onClear, onSavePool, poolCount }: {
  pinnedIds: string[]; onCompare: () => void; onClear: () => void; onSavePool: () => void; poolCount: number;
}) {
  const [poolsOpen, setPoolsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <span className="text-sm font-medium text-slate-700">{pinnedIds.length} selected</span>
      <div className="flex items-center gap-1.5">
        {pinnedIds.map((id) => {
          const inst = ALL_INSTITUTIONS.find((i) => i.id === id);
          if (!inst) return null;
          const c = COLOR_MAP[inst.color];
          return <span key={id} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", c.light, c.text)}>{inst.name}</span>;
        })}
      </div>
      <div className="h-5 w-px bg-slate-200" />
      <button onClick={onCompare} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors">
        <ArrowUpRight className="h-3.5 w-3.5" /> Compare
      </button>
      <button onClick={onSavePool} className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
        <Plus className="h-3 w-3" /> Save as Pool
      </button>
      <div className="relative">
        <button onClick={() => setPoolsOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Layers className="h-3 w-3" /> Pools {poolCount > 0 && `(${poolCount})`}
        </button>
        {poolsOpen && <PoolsManager onClose={() => setPoolsOpen(false)} />}
      </div>
      <button onClick={onClear} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

function HeroSection() {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InstitutionResult[]>(ALL_INSTITUTIONS);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [cohiMode, setCohiMode] = useState(false);
  const [cohiResponse, setCohiResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [modalInstitution, setModalInstitution] = useState<InstitutionResult | null>(null);
  const [buyerModalId, setBuyerModalId] = useState<string | null>(null);
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
        setCohiResponse("Sorry, Cohi couldn't connect. Portfolio summary: 7,052 loans, $1.86B UPB, WA FICO 744, WA Rate 3.50%, WA LTV 71.42%.");
        setResults(INSTITUTIONS);
      } finally {
        setIsLoading(false);
      }
    } else {
      const lower = q.toLowerCase();
      const matched = ALL_INSTITUTIONS.filter((i) =>
        i.name.toLowerCase().includes(lower) ||
        i.id.toLowerCase().includes(lower) ||
        (i.hq ?? "").toLowerCase().includes(lower) ||
        (i.institutionType ?? "").toLowerCase().includes(lower) ||
        i.topStates.some((st) => st.s.toLowerCase() === lower)
      );
      setResults(matched.length > 0 ? matched : ALL_INSTITUTIONS);
    }
  }, [cohiMode]);

  const handleSubmit = useCallback(() => handleSearch(query), [query, handleSearch]);

  const handleQuickAction = useCallback((action: string, state?: string) => {
    setActiveAction(action);
    setCohiResponse(null);
    setQuery("");
    if (action === "top") {
      const sellers = [...INSTITUTIONS].sort((a, b) => b.waFico - a.waFico || a.waRate - b.waRate);
      setResults([...sellers, ...BUYERS]);
    } else if (action === "risk") {
      const sellers = [...INSTITUTIONS].sort((a, b) => a.waLtv - b.waLtv);
      setResults([...sellers, ...BUYERS]);
    } else if (action === "new") {
      const ranked = INSTITUTIONS.map((i) => ({ ...i, count: Math.round(i.count * 0.28), upb: Math.round(i.upb * 0.28) })).sort((a, b) => b.count - a.count);
      setResults([...ranked, ...BUYERS]);
    } else if (action === "state" && state) {
      const ranked = [...INSTITUTIONS]
        .map((i) => ({ ...i, _sc: (SELLER_STATE_COUNTS[i.id] ?? {})[state] ?? 0 }))
        .sort((a, b) => (b as any)._sc - (a as any)._sc);
      setResults([...ranked, ...BUYERS]);
    } else if (action === "compare") {
      setCompareOpen(true);
    }
  }, []);

  const handlePin = useCallback((id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleMicToggle = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e: any) => { const t: string = e.results[0][0].transcript; setQuery(t); setIsListening(false); handleSearch(t, cohiMode); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r; r.start(); setIsListening(true);
  }, [isListening, cohiMode, handleSearch]);

  const handleView = useCallback((inst: InstitutionResult) => {
    if (inst.kind === "buyer") setBuyerModalId(inst.buyerId ?? inst.id);
    else setModalInstitution(inst);
  }, []);

  const pinnedIds = Array.from(pinned);
  const pinnedInstitutions = ALL_INSTITUTIONS.filter((i) => pinned.has(i.id));

  return (
    <section className="flex flex-col items-center justify-end pb-16 flex-1 relative px-4 pt-20">
      <ResultsPanel
        results={results} viewMode={viewMode} onViewModeChange={setViewMode}
        cohiResponse={cohiResponse} isLoading={isLoading}
        pinned={pinned} onPin={handlePin} onView={handleView}
      />

      <QuickActions active={activeAction} onSelect={handleQuickAction} pinnedCount={pinnedIds.length} />

      <SearchBar
        query={query} onQueryChange={setQuery} onSubmit={handleSubmit}
        cohiMode={cohiMode} onCohiToggle={() => setCohiMode((v) => !v)}
        isListening={isListening} onMicToggle={handleMicToggle} isLoading={isLoading}
      />

      <p className={cn("mt-3 text-xs", isDark ? "text-white/40" : "text-slate-400")}>
        Search {ALL_INSTITUTIONS.length} institutions · Filter by category · Ask Cohi a question
      </p>

      {pinnedIds.length >= 2 && (
        <CompareBar
          pinnedIds={pinnedIds}
          onCompare={() => setCompareOpen(true)}
          onClear={() => setPinned(new Set())}
          onSavePool={() => createPool(pinnedIds)}
          poolCount={pools.length}
        />
      )}

      {modalInstitution && (
        <LenderDrilldownModal lender={modalInstitution.name} onClose={() => setModalInstitution(null)} />
      )}

      {buyerModalId && (
        <BuyerModal buyerId={buyerModalId} onClose={() => setBuyerModalId(null)} />
      )}

      {compareOpen && pinnedInstitutions.length >= 2 && (
        <InstitutionCompareModal institutions={pinnedInstitutions} onClose={() => setCompareOpen(false)} />
      )}
    </section>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

export default function Landing() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("sx-theme") === "dark"; } catch { return false; }
  });

  const toggle = useCallback(() => {
    setIsDark((d) => {
      const next = !d;
      try { localStorage.setItem("sx-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ isDark, toggle }}>
      <div className={cn(
        "relative min-h-screen flex flex-col overflow-hidden transition-colors duration-300",
        isDark
          ? "bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950"
          : "bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50",
      )}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(14,165,233,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(99,102,241,0.10) 0%, transparent 60%)"
              : "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(14,165,233,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)",
          }}
        />
        <LandingNav />
        <HeroSection />
      </div>
    </ThemeCtx.Provider>
  );
}
