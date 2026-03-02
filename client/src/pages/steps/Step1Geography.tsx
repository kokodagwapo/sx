import { useState, useMemo } from "react";
import {
  MapPin,
  Globe,
  BarChart2,
  LayoutList,
  Percent,
  CircleDot,
  Sparkles,
  Pin,
  PinOff,
  Table2,
  X,
  ChevronDown,
  Banknote,
  Hash,
  Package,
} from "lucide-react";
import { step1Kpis } from "@/data/mock/step1Kpis";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { PanelCard } from "@/components/cards/PanelCard";
import { GeoDrilldownMap } from "@/components/maps/GeoDrilldownMap";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DataTable, sortableColumn } from "@/components/tables/DataTable";
import {
  step1LoansByGeo,
  step1StateBars,
  type LoanGeoRecord,
} from "@/data/mock/step1";
import { cn } from "@/lib/utils";

const STATE_ABBR = new Map([
  ["California", "CA"], ["Florida", "FL"], ["Georgia", "GA"], ["New York", "NY"], ["Pennsylvania", "PA"],
  ["Texas", "TX"], ["Virginia", "VA"], ["Ohio", "OH"], ["North Carolina", "NC"], ["New Jersey", "NJ"],
  ["Illinois", "IL"], ["Massachusetts", "MA"], ["Michigan", "MI"], ["Arizona", "AZ"], ["Washington", "WA"],
  ["Oregon", "OR"], ["Indiana", "IN"], ["Tennessee", "TN"], ["South Carolina", "SC"], ["Maryland", "MD"],
  ["Delaware", "DE"], ["Missouri", "MO"], ["Colorado", "CO"], ["Wisconsin", "WI"], ["Minnesota", "MN"],
  ["Alabama", "AL"], ["Louisiana", "LA"], ["Kentucky", "KY"], ["Oklahoma", "OK"], ["Utah", "UT"],
  ["Connecticut", "CT"], ["Rhode Island", "RI"], ["Maine", "ME"], ["New Hampshire", "NH"], ["Vermont", "VT"],
  ["Nebraska", "NE"], ["Kansas", "KS"], ["Mississippi", "MS"], ["West Virginia", "WV"], ["Idaho", "ID"],
  ["Nevada", "NV"], ["Wyoming", "WY"],
  ["Alaska", "AK"], ["Hawaii", "HI"], ["Arkansas", "AR"], ["District of Columbia", "DC"], ["Iowa", "IA"],
  ["Montana", "MT"], ["New Mexico", "NM"], ["North Dakota", "ND"], ["South Dakota", "SD"],
]);

type LoansTableRow = {
  id: string;
  state: string;
  stateAbbr: string;
  county: string;
  tract: string;
  loanCount: number;
  upb: number;
  /** Loan-level fields when expanded to individual loans */
  tvm?: string;
  loanAmount?: number;
  rate?: number;
  productType?: string;
  city?: string;
};

export default function Step1Geography() {
  const [selectedLevel, setSelectedLevel] = useState<"state" | "county" | "tract">("state");
  const [selectedName, setSelectedName] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<LoanGeoRecord[]>([]);
  const [stateFilter, setStateFilter] = useState("");
  const [loansDrilldownOpen, setLoansDrilldownOpen] = useState(false);
  const [pinnedStates, setPinnedStates] = useState<Set<string>>(new Set());
  const [expandToIndividualLoans, setExpandToIndividualLoans] = useState(false);
  const [chartBarSelected, setChartBarSelected] = useState<string | null>(null);
  const [drilldownExpandToLoans, setDrilldownExpandToLoans] = useState(false);
  const [pinnedLoans, setPinnedLoans] = useState<Set<string>>(new Set());

  /** Loans for map: filter by state input when set */
  const mapLoans = useMemo(() => {
    if (!stateFilter.trim()) return step1LoansByGeo;
    const q = stateFilter.trim().toUpperCase();
    return step1LoansByGeo.filter((l) => {
      const abbr = STATE_ABBR.get(l.stateName);
      return abbr === q || l.stateName.toUpperCase().includes(q) || l.stateName.toUpperCase().startsWith(q);
    });
  }, [stateFilter]);

  /** Loans for summary/narrative: drilldown selection, or filtered/full set */
  const displayLoans = useMemo(() => {
    if (selectedLoans.length > 0) return selectedLoans;
    return mapLoans;
  }, [selectedLoans, mapLoans]);

  const barData = useMemo(() => {
    if ((selectedLevel === "county" || selectedLevel === "tract") && selectedLoans.length > 0) {
      return selectedLoans
        .map((l) => ({ name: l.tractName, value: l.loanCount }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
    }
    if (selectedLevel === "state" && selectedLoans.length > 0) {
      const byCounty = new Map<string, number>();
      for (const l of selectedLoans) {
        byCounty.set(l.countyName, (byCounty.get(l.countyName) ?? 0) + l.loanCount);
      }
      return Array.from(byCounty.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
    }
    if (displayLoans.length > 0 && displayLoans.length < step1LoansByGeo.length) {
      const byState = new Map<string, number>();
      for (const l of displayLoans) {
        byState.set(l.stateName, (byState.get(l.stateName) ?? 0) + l.loanCount);
      }
      return Array.from(byState.entries())
        .map(([name, value]) => ({ name: STATE_ABBR.get(name) ?? name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
    }
    return step1StateBars;
  }, [selectedLevel, selectedLoans, displayLoans]);

  const totalLoans = useMemo(
    () => displayLoans.reduce((s, l) => s + l.loanCount, 0),
    [displayLoans]
  );
  const totalStates = useMemo(
    () => new Set(displayLoans.map((l) => l.stateName)).size,
    [displayLoans]
  );
  const totalCounties = useMemo(
    () => new Set(displayLoans.map((l) => l.countyFips)).size,
    [displayLoans]
  );
  const totalTracts = useMemo(
    () => new Set(displayLoans.map((l) => l.tractFips)).size,
    [displayLoans]
  );
  const totalUpb = useMemo(
    () => displayLoans.reduce((s, l) => s + l.upb, 0),
    [displayLoans]
  );
  const weightedAvgCoupon = "4.13";

  const narrativeBullets = useMemo(() => {
    const top3 = barData.slice(0, 3);
    const [first, second, third] = top3;
    const pct1 = totalLoans > 0 ? ((first?.value ?? 0) / totalLoans * 100).toFixed(1) : "0";
    const pct2 = totalLoans > 0 ? ((second?.value ?? 0) / totalLoans * 100).toFixed(1) : "0";
    const pct3 = totalLoans > 0 ? ((third?.value ?? 0) / totalLoans * 100).toFixed(1) : "0";

    if (selectedLevel === "tract" && selectedLoans.length > 0) {
      return [
        `Drilled to ${totalTracts} census tract(s) with ${totalLoans.toLocaleString()} loans.`,
        `Total UPB: $${(totalUpb / 1_000_000).toFixed(1)}M across ${selectedName || "selected area"}.`,
        "Select a state or county on the map to explore.",
      ];
    }
    if (selectedLevel === "county" && selectedName) {
      return [
        `${selectedName} has ${totalLoans.toLocaleString()} loans across ${totalTracts} census tracts.`,
        `Total UPB: $${(totalUpb / 1_000_000).toFixed(1)}M.`,
        "Click a county to see tract-level detail.",
      ];
    }
    if (selectedLevel === "state" && selectedName) {
      return [
        `${selectedName} has ${totalLoans.toLocaleString()} loans across ${totalCounties} counties and ${totalTracts} census tracts.`,
        `Total UPB: $${(totalUpb / 1_000_000).toFixed(1)}M.`,
        "Click a county to drill to census tracts.",
      ];
    }

    return [
      `Total Available Loans is ${totalLoans.toLocaleString()} across ${totalStates} states, ${totalCounties} counties, and ${totalTracts} census tracts.`,
      first && second && third
        ? `Top geographies: ${first.name} (${first.value}, ${pct1}%), ${second.name} (${second.value}, ${pct2}%), ${third.name} (${third.value}, ${pct3}%).`
        : `Distribution spans state, county, and census tract levels.`,
      "Use the map to drill down: State → County → Census Tract.",
      "The State filter above narrows the view by state abbreviation or name.",
    ];
  }, [selectedLevel, selectedName, selectedLoans, totalLoans, totalStates, totalCounties, totalTracts, totalUpb, barData]);

  const keyTakeaways = useMemo(() => {
    const insights: string[] = [];
    const topState = barData[0];
    const pctTop = totalLoans > 0 && topState ? ((topState.value / totalLoans) * 100).toFixed(1) : "0";

    if (selectedLevel === "tract" && selectedLoans.length > 0) {
      const topTract = selectedLoans.reduce((a, b) => (a.loanCount > b.loanCount ? a : b));
      insights.push(`Concentration risk: ${topTract.tractName} holds ${topTract.loanCount} loans ($${(topTract.upb / 1_000_000).toFixed(1)}M UPB)—highest density in this geography.`);
      insights.push(`Recommendation: Conduct granular pricing and credit review for tracts exceeding ${Math.round(totalLoans / totalTracts) + 10} loans to optimize risk-adjusted returns.`);
    } else if (selectedLevel === "county" && selectedName) {
      const avgPerTract = totalTracts > 0 ? (totalLoans / totalTracts).toFixed(0) : "0";
      insights.push(`${selectedName} shows ${avgPerTract} loans/tract across ${totalTracts} tracts—evaluate market penetration and competitive positioning.`);
      insights.push(`Strategic opportunity: $${(totalUpb / 1_000_000).toFixed(1)}M UPB indicates material refinance potential; prioritize retention and cross-sell initiatives.`);
    } else if (selectedLevel === "state" && selectedName) {
      insights.push(`${selectedName} footprint: ${totalCounties} counties, ${totalTracts} tracts—assess geographic diversification vs. concentration limits.`);
      insights.push(`Portfolio concentration: State represents ${pctTop}% of book; consider capital allocation and regulatory exposure thresholds.`);
    } else {
      if (topState) {
        insights.push(`Primary exposure: ${topState.name} leads with ${topState.value} loans (${pctTop}% of portfolio)—key market for strategic planning.`);
      }
      insights.push(`Geographic breadth: ${totalStates} states, ${totalCounties} counties, ${totalTracts} tracts—full visibility for risk and opportunity assessment.`);
      insights.push(`Next step: Drill into high-concentration markets for actionable county and tract-level insights.`);
    }
    return insights;
  }, [selectedLevel, selectedName, selectedLoans, totalLoans, totalStates, totalCounties, totalTracts, totalUpb, barData]);

  /** Loans per state for drilldown */
  const loansByState = useMemo(() => {
    const byState = new Map<string, { loans: number; upb: number }>();
    for (const l of displayLoans) {
      const abbr = STATE_ABBR.get(l.stateName) ?? l.stateName;
      const cur = byState.get(abbr) ?? { loans: 0, upb: 0 };
      byState.set(abbr, {
        loans: cur.loans + l.loanCount,
        upb: cur.upb + l.upb,
      });
    }
    return Array.from(byState.entries())
      .map(([state, data]) => ({ state, ...data }))
      .sort((a, b) => b.loans - a.loans);
  }, [displayLoans]);

  /** Deterministic synthetic loan attributes from tract id + index */
  const synthLoan = (tractId: string, idx: number) => {
    const h = (tractId + idx).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const products = ["30 FRM", "30 FRM", "15 FRM", "5/1 ARM", "7/1 ARM"];
    const rates = [3.375, 3.5, 3.75, 4.0, 4.125, 4.25, 4.5, 4.625];
    const base = String(100000 + (h % 900000));
    return {
      tvm: `TV${base}${String(idx + 1).padStart(3, "0")}`,
      rate: rates[h % rates.length],
      productType: products[h % products.length],
    };
  };

  /** Table rows: tract-level or expanded to individual loans, filterable by pinned states */
  const loansTableRows = useMemo((): LoansTableRow[] => {
    let base = displayLoans.map((l) => ({
      id: l.id,
      state: l.stateName,
      stateAbbr: STATE_ABBR.get(l.stateName) ?? l.stateName,
      county: l.countyName,
      tract: l.tractName,
      loanCount: l.loanCount,
      upb: l.upb,
      city: l.city,
    }));
    if (pinnedStates.size > 0) {
      base = base.filter((r) => pinnedStates.has(r.stateAbbr));
    }
    if (!expandToIndividualLoans) return base;
    const expanded: LoansTableRow[] = [];
    for (const row of base) {
      const upbPerLoan = row.loanCount > 0 ? Math.round(row.upb / row.loanCount) : 0;
      for (let i = 0; i < row.loanCount; i++) {
        const { tvm, rate, productType } = synthLoan(row.id, i);
        expanded.push({
          ...row,
          id: `${row.id}-${i}`,
          loanCount: 1,
          upb: upbPerLoan,
          tvm,
          loanAmount: upbPerLoan,
          rate,
          productType,
        });
      }
    }
    return expanded;
  }, [displayLoans, pinnedStates, expandToIndividualLoans]);

  const togglePin = (stateAbbr: string) => {
    setPinnedStates((prev) => {
      const next = new Set(prev);
      if (next.has(stateAbbr)) next.delete(stateAbbr);
      else next.add(stateAbbr);
      return next;
    });
  };

  /** Reverse: state abbr -> state name */
  const ABBR_TO_STATE = useMemo(() => {
    const m = new Map<string, string>();
    STATE_ABBR.forEach((abbr, name) => m.set(abbr, name));
    return m;
  }, []);

  /** Drilldown data when a chart bar is clicked */
  const chartBarDrilldown = useMemo(() => {
    if (!chartBarSelected) return null;
    const name = chartBarSelected;

    if (selectedLevel === "tract" && selectedLoans.length > 0) {
      const tract = selectedLoans.find((l) => l.tractName === name);
      if (!tract) return null;
      return {
        type: "tract" as const,
        title: tract.tractName,
        subtitle: `${tract.countyName}, ${STATE_ABBR.get(tract.stateName) ?? tract.stateName}`,
        loans: tract.loanCount,
        upb: tract.upb,
        sourceLoans: [tract],
        details: [
          { label: "State", value: tract.stateName },
          { label: "County", value: tract.countyName },
          { label: "City", value: tract.city ?? "—" },
          { label: "Loan Count", value: tract.loanCount.toLocaleString() },
          { label: "UPB", value: `$${(tract.upb / 1_000_000).toFixed(2)}M` },
        ],
      };
    }

    if (selectedLevel === "county" && selectedLoans.length > 0) {
      const countyLoans = selectedLoans.filter((l) => l.countyName === name);
      if (countyLoans.length === 0) return null;
      const loans = countyLoans.reduce((s, l) => s + l.loanCount, 0);
      const upb = countyLoans.reduce((s, l) => s + l.upb, 0);
      const stateName = countyLoans[0]?.stateName ?? "";
      const tracts = countyLoans.map((l) => ({ name: l.tractName, loans: l.loanCount, upb: l.upb }));
      return {
        type: "county" as const,
        title: name,
        subtitle: `${STATE_ABBR.get(stateName) ?? stateName}`,
        loans,
        upb,
        sourceLoans: countyLoans,
        details: [
          { label: "State", value: stateName },
          { label: "Tracts", value: tracts.length.toString() },
          { label: "Loan Count", value: loans.toLocaleString() },
          { label: "UPB", value: `$${(upb / 1_000_000).toFixed(2)}M` },
        ],
        tracts: tracts.sort((a, b) => b.loans - a.loans).slice(0, 10),
      };
    }

    if (selectedLevel === "state" || (!selectedName && barData.some((b) => b.name === name))) {
      const stateName = ABBR_TO_STATE.get(name) ?? name;
      const stateLoans = displayLoans.filter(
        (l) => l.stateName === stateName || (STATE_ABBR.get(l.stateName) ?? l.stateName) === name
      );
      if (stateLoans.length === 0) return null;
      const loans = stateLoans.reduce((s, l) => s + l.loanCount, 0);
      const upb = stateLoans.reduce((s, l) => s + l.upb, 0);
      const byCounty = new Map<string, { loans: number; upb: number }>();
      for (const l of stateLoans) {
        const cur = byCounty.get(l.countyName) ?? { loans: 0, upb: 0 };
        byCounty.set(l.countyName, {
          loans: cur.loans + l.loanCount,
          upb: cur.upb + l.upb,
        });
      }
      const counties = Array.from(byCounty.entries())
        .map(([county, data]) => ({ name: county, ...data }))
        .sort((a, b) => b.loans - a.loans)
        .slice(0, 10);
      return {
        type: "state" as const,
        title: stateName,
        subtitle: name,
        loans,
        upb,
        sourceLoans: stateLoans,
        details: [
          { label: "State", value: stateName },
          { label: "Counties", value: byCounty.size.toString() },
          { label: "Tracts", value: new Set(stateLoans.map((l) => l.tractFips)).size.toString() },
          { label: "Loan Count", value: loans.toLocaleString() },
          { label: "UPB", value: `$${(upb / 1_000_000).toFixed(2)}M` },
        ],
        counties,
      };
    }

    return null;
  }, [chartBarSelected, selectedLevel, selectedLoans, displayLoans, barData, selectedName, ABBR_TO_STATE]);

  /** Individual loans for drilldown panel when expanded */
  const drilldownLoanRows = useMemo((): LoansTableRow[] => {
    if (!chartBarDrilldown || !("sourceLoans" in chartBarDrilldown) || !chartBarDrilldown.sourceLoans) return [];
    const source = chartBarDrilldown.sourceLoans as LoanGeoRecord[];
    const expanded: LoansTableRow[] = [];
    for (const l of source) {
      const upbPerLoan = l.loanCount > 0 ? Math.round(l.upb / l.loanCount) : 0;
      for (let i = 0; i < l.loanCount; i++) {
        const { tvm, rate, productType } = synthLoan(l.id, i);
        expanded.push({
          id: `${l.id}-${i}`,
          state: l.stateName,
          stateAbbr: STATE_ABBR.get(l.stateName) ?? l.stateName,
          county: l.countyName,
          tract: l.tractName,
          loanCount: 1,
          upb: upbPerLoan,
          tvm,
          loanAmount: upbPerLoan,
          rate,
          productType,
          city: l.city,
        });
      }
    }
    return expanded;
  }, [chartBarDrilldown]);

  const togglePinLoan = (loanId: string) => {
    setPinnedLoans((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) next.delete(loanId);
      else next.add(loanId);
      return next;
    });
  };

  const loansTableColumns = [
    sortableColumn<LoansTableRow>("stateAbbr", "State", {
      icon: MapPin,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("county", "County", {
      icon: MapPin,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("tract", "Tract", {
      icon: Hash,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("city", "City", {
      icon: MapPin,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("tvm", "TVMA Inventory #", {
      icon: Hash,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("loanAmount", "Loan Amount", {
      icon: Banknote,
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        return v != null ? Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(v) : "—";
      },
      sortingFn: "numeric",
    }),
    sortableColumn<LoansTableRow>("rate", "Interest Rate", {
      icon: Percent,
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        return v != null ? v.toFixed(3) : "—";
      },
      sortingFn: "numeric",
    }),
    sortableColumn<LoansTableRow>("productType", "Product Type", {
      icon: Package,
      sortingFn: "string",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    sortableColumn<LoansTableRow>("loanCount", "# Loans", {
      icon: LayoutList,
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        return v != null ? Intl.NumberFormat("en-US").format(v) : "—";
      },
      sortingFn: "numeric",
    }),
    sortableColumn<LoansTableRow>("upb", "UPB", {
      icon: Banknote,
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        return v != null ? Intl.NumberFormat("en-US").format(v) : "—";
      },
      sortingFn: "numeric",
    }),
  ];

  return (
    <SprinkleShell
      stepId="1"
      kpis={step1Kpis}
      animateKpis
      kpiCompact
    >
      {/* Top: Left = KPIs + filter + narrative | Right = Map (prominent) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,356px)_1fr] lg:items-start">
        {/* Left column: metrics + controls + insights */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-2 opacity-0 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setLoansDrilldownOpen((o) => !o)}
              className={cn(
                "rounded-xl border border-white/60 bg-white p-3 text-left shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-slate-200/80",
                loansDrilldownOpen && "ring-2 ring-sky-500/30 border-sky-300/80"
              )}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
                    <LayoutList className="h-2.5 w-2.5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Total Loans
                  </span>
                </div>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", loansDrilldownOpen && "rotate-180")}
                />
              </div>
              <div className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                {totalLoans.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[9px] text-sky-600 font-medium">Click for drilldown</div>
            </button>
            <div className="rounded-xl border border-white/60 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600">
                  <Percent className="h-2.5 w-2.5" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  WAC
                </span>
              </div>
              <div className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                {weightedAvgCoupon}
              </div>
            </div>
          </div>

          {/* State filter */}
          <div className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Filter by State</label>
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="e.g. CA, FL, TX"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Narrative + Key Takeaways — compact */}
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={MapPin}
            title="Geographic Distribution"
            subtitle="State → County → Census Tract"
          >
            <div className="space-y-3 text-sm leading-relaxed text-slate-700">
              {narrativeBullets.slice(0, 3).map((bullet, i) => (
                <p key={i} className="flex gap-2">
                  <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500/70" strokeWidth={2.5} />
                  <span>{bullet}</span>
                </p>
              ))}
              {keyTakeaways.length > 0 && (
                <div className="rounded-lg bg-emerald-50/60 px-3 py-2.5 border border-emerald-200/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    Key Takeaways
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800/90">
                    {keyTakeaways.map((insight, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </PanelCard>
        </div>

        {/* Right column: Map — primary visual, top right */}
        <div className="order-1 lg:order-2 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1">
          <PanelCard
            icon={Globe}
            title="Interactive Map"
            subtitle="County choropleth • Click to drill down to state → tract"
            className="border-0 shadow-none bg-transparent [&>header]:hidden"
            contentClassName="!p-0"
          >
            <div className="h-[564px] min-h-[464px] overflow-hidden rounded-xl">
              <GeoDrilldownMap
                loans={mapLoans}
                onSelectionChange={(level, name, loans) => {
                  setSelectedLevel(level);
                  setSelectedName(name);
                  setSelectedLoans(loans);
                }}
              />
            </div>
          </PanelCard>
        </div>
      </div>

      {/* Loans drilldown — full width */}
      {loansDrilldownOpen && (
        <div className="mt-4 opacity-0 animate-fade-in-up rounded-xl border border-sky-200/60 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 bg-sky-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600">
                <LayoutList className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Loans by State — Drilldown & Compare</h3>
                <p className="text-xs text-slate-500">Pin states to compare • Expand to individual loan data (TVMA, rate, product)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoansDrilldownOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>

          <div className="p-4">
            {/* Pinned states bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                <Pin className="h-4 w-4 text-sky-500" />
                Pin states to compare
              </div>
              <div className="flex flex-wrap gap-2">
                {loansByState.map(({ state, loans, upb }) => {
                  const isPinned = pinnedStates.has(state);
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => togglePin(state)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                        isPinned
                          ? "border-sky-500/60 bg-sky-500/15 text-sky-800 shadow-sm"
                          : "border-slate-200/80 bg-slate-50/60 text-slate-600 hover:border-sky-300/60 hover:bg-sky-50/40"
                      )}
                    >
                      {isPinned ? (
                        <Pin className="h-3.5 w-3.5 text-sky-600" />
                      ) : (
                        <PinOff className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="font-semibold">{state}</span>
                      <span className="text-slate-500">({loans.toLocaleString()} loans, ${(upb / 1_000_000).toFixed(1)}M UPB)</span>
                    </button>
                  );
                })}
              </div>
              {pinnedStates.size > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-sky-700 font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Comparing {pinnedStates.size} state{pinnedStates.size > 1 ? "s" : ""} — table filtered below
                </div>
              )}
            </div>

            {/* Loans table */}
            <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-2.5 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    {pinnedStates.size > 0
                      ? `Loans in ${Array.from(pinnedStates).join(", ")} — ${loansTableRows.length} ${expandToIndividualLoans ? "loan(s)" : "tract(s)"}`
                      : `All loans by geography — ${loansTableRows.length} ${expandToIndividualLoans ? "loan(s)" : "tract(s)"}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandToIndividualLoans((v) => !v)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                    expandToIndividualLoans
                      ? "bg-sky-500/20 text-sky-700"
                      : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
                  )}
                >
                  {expandToIndividualLoans ? "Group by tract" : "Expand to individual loans"}
                </button>
              </div>
              <DataTable
                data={loansTableRows}
                columns={loansTableColumns}
                height={expandToIndividualLoans ? 480 : 320}
                stripeRows
                animateRows
              />
            </div>
          </div>
        </div>
      )}

      {/* Bar chart — full width below */}
      <PanelCard
        className="mt-4 opacity-0 animate-fade-in-up animate-fade-in-up-delay-3"
        icon={BarChart2}
        title={
          selectedLevel === "tract"
            ? "Distribution by Census Tract"
            : selectedLevel === "county"
              ? "Geographic Distribution by County"
              : "Geographic Distribution by State"
        }
        subtitle={
          selectedLevel === "state"
            ? "Selecting a State drills down to Distribution by County"
            : selectedLevel === "county"
              ? "Click a bar or county on the map for drilldown"
              : `Click a bar for details • ${totalTracts} tract(s) in view`
        }
        right={
          selectedName ? (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
              {selectedName}
            </span>
          ) : undefined
        }
      >
        <div className="h-[320px] min-h-[240px] w-full overflow-y-auto overflow-x-hidden">
          <div className="w-full" style={{ height: Math.max(320, barData.length * 36) }}>
            <HorizontalBarChart
              data={barData}
              valueBasedColors={selectedLevel === "state" || selectedLevel === "county"}
              colorScheme="geo"
              onBarClick={(name) => setChartBarSelected((prev) => (prev === name ? null : name))}
              showValueLabels
              xAxisLabel={selectedLevel === "state" || selectedLevel === "county" ? "# of Selected Loans" : undefined}
            />
          </div>
        </div>
      </PanelCard>

      {/* Chart bar drilldown panel */}
      {chartBarDrilldown && (
        <div className="mt-4 opacity-0 animate-fade-in-up rounded-xl border border-sky-200/60 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 bg-sky-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600">
                <BarChart2 className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{chartBarDrilldown.title}</h3>
                <p className="text-xs text-slate-500">{chartBarDrilldown.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {"sourceLoans" in chartBarDrilldown && chartBarDrilldown.sourceLoans && (
                <button
                  type="button"
                  onClick={() => setDrilldownExpandToLoans((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 transition-colors"
                >
                  <Table2 className="h-4 w-4" />
                  {drilldownExpandToLoans ? "Collapse" : "Expand to individual loans"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setChartBarSelected(null);
                  setDrilldownExpandToLoans(false);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              {chartBarDrilldown.details.map((d) => (
                <div key={d.label} className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{d.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{d.value}</div>
                </div>
              ))}
            </div>
            {"counties" in chartBarDrilldown && chartBarDrilldown.counties && chartBarDrilldown.counties.length > 0 && !drilldownExpandToLoans && (
              <div className="rounded-lg border border-slate-200/70 bg-white overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50/80 border-b border-slate-200/70">
                  Top counties
                </div>
                <ul className="divide-y divide-slate-100">
                  {chartBarDrilldown.counties.map((c) => (
                    <li key={c.name} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="tabular-nums text-slate-600">
                        {c.loans.toLocaleString()} loans • ${(c.upb / 1_000_000).toFixed(2)}M
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {"tracts" in chartBarDrilldown && chartBarDrilldown.tracts && chartBarDrilldown.tracts.length > 0 && !drilldownExpandToLoans && (
              <div className="rounded-lg border border-slate-200/70 bg-white overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50/80 border-b border-slate-200/70">
                  Top tracts
                </div>
                <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {chartBarDrilldown.tracts.map((t) => (
                    <li key={t.name} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700 truncate">{t.name}</span>
                      <span className="tabular-nums text-slate-600 shrink-0 ml-2">
                        {t.loans.toLocaleString()} • ${(t.upb / 1_000_000).toFixed(2)}M
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Individual loans — drilldown with pin to compare */}
            {drilldownExpandToLoans && drilldownLoanRows.length > 0 && (
              <div className="rounded-lg border border-slate-200/70 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50/80 border-b border-slate-200/70">
                  <span>Individual loans ({drilldownLoanRows.length})</span>
                  {pinnedLoans.size > 0 && (
                    <span className="text-sky-600 font-medium">{pinnedLoans.size} pinned to compare</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 w-8"></th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">TVMA</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">County</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Tract</th>
                        <th className="px-3 py-2 text-right font-medium text-slate-600">Loans</th>
                        <th className="px-3 py-2 text-right font-medium text-slate-600">UPB</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Rate</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600">Product</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drilldownLoanRows.map((row) => {
                        const isPinned = pinnedLoans.has(row.id);
                        return (
                          <tr key={row.id} className={cn("border-t border-slate-100", isPinned && "bg-sky-50/50")}>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => togglePinLoan(row.id)}
                                className={cn(
                                  "rounded p-1 transition-colors",
                                  isPinned ? "text-sky-600 hover:text-sky-700" : "text-slate-400 hover:text-sky-600"
                                )}
                                aria-label={isPinned ? "Unpin loan" : "Pin to compare"}
                              >
                                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-800">{row.tvm ?? "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{row.county}</td>
                            <td className="px-3 py-2 text-slate-700 truncate max-w-[120px]">{row.tract}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700">{row.loanCount}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                              {row.upb != null ? Intl.NumberFormat("en-US").format(row.upb) : "—"}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{row.rate != null ? row.rate.toFixed(3) : "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{row.productType ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500 [font-family:var(--font-sans)]">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
