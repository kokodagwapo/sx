import { useQuery } from "@tanstack/react-query";
import { Building2, ShieldCheck, AlertCircle, Loader2, ExternalLink, DollarSign, MapPin, Hash, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUYER_REGISTRY, BUYER_COLOR_MAP, type BuyerEntry } from "@/data/mock/buyerRegistry";

type FdicInstitution = {
  NAME?: string; name?: string;
  CERT?: number; cert?: number;
  CITY?: string; city?: string;
  STNAME?: string; stname?: string;
  ASSET?: number; asset?: number;
  CLASS?: string; class?: string;
  ACTIVE?: number; active?: number;
  REPDTE?: string; repdte?: string;
  INSTCAT?: string; instcat?: string;
};

type FdicResponse = {
  data?: Array<{ data: FdicInstitution }>;
  error?: string;
};

function fmtAssets(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}B`;
  if (v >= 1_000)         return `$${(v / 1_000).toFixed(0)}M`;
  return `$${v}K`;
}

function charterLabel(cls?: string): string {
  const map: Record<string, string> = {
    N: "Nat'l Bank (OCC)", SM: "State Mbr (FRB)", NM: "State Non-Mbr", SB: "Savings Bank", SA: "Savings Assoc", OI: "Other Insured",
  };
  return cls ? (map[cls] ?? cls) : "—";
}

function TypeBadge({ type }: { type: BuyerEntry["type"] }) {
  const map = {
    bank:         { label: "FDIC-Insured Bank",    cls: "bg-sky-100 text-sky-700" },
    credit_union: { label: "NCUA Credit Union",    cls: "bg-emerald-100 text-emerald-700" },
    insurance:    { label: "Insurance Co.",         cls: "bg-amber-100 text-amber-700" },
    gse:          { label: "Gov't-Sponsored Entity", cls: "bg-violet-100 text-violet-700" },
  };
  const { label, cls } = map[type];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", cls)}>
      {label}
    </span>
  );
}

function FdicData({ entry }: { entry: BuyerEntry }) {
  const { data, isLoading, isError } = useQuery<FdicResponse>({
    queryKey: ["/api/fdic/search", entry.fdicSearchName],
    queryFn: async () => {
      const res = await fetch(`/api/fdic/search?name=${encodeURIComponent(entry.fdicSearchName!)}`);
      if (!res.ok) throw new Error("FDIC error");
      return res.json();
    },
    enabled: !!entry.fdicSearchName,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Fetching FDIC data…
      </div>
    );
  }

  if (isError || !data?.data?.length) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-1">
        <AlertCircle className="h-3 w-3 text-amber-400" /> FDIC data unavailable
      </div>
    );
  }

  const inst = data.data[0].data;
  const name   = inst.NAME   ?? inst.name   ?? "—";
  const cert   = inst.CERT   ?? inst.cert;
  const city   = inst.CITY   ?? inst.city   ?? "—";
  const state  = inst.STNAME ?? inst.stname ?? "—";
  const asset  = inst.ASSET  ?? inst.asset  ?? 0;
  const cls    = inst.CLASS  ?? inst.class;
  const active = inst.ACTIVE ?? inst.active ?? 0;
  const repdte = inst.REPDTE ?? inst.repdte ?? "";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-700 truncate">{name}</span>
        <span className={cn("ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold", active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
          {active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500">
          <Hash className="h-2.5 w-2.5 shrink-0" />
          <span>Cert #{cert ?? "—"}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{city}, {state}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <DollarSign className="h-2.5 w-2.5 shrink-0" />
          <span>Assets: {fmtAssets(asset)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Layers className="h-2.5 w-2.5 shrink-0" />
          <span>{charterLabel(cls)}</span>
        </div>
      </div>
      {repdte && (
        <p className="text-[9px] text-slate-300">As of {repdte.slice(0,4)}-{repdte.slice(4,6)}-{repdte.slice(6,8)} · FDIC Call Report</p>
      )}
    </div>
  );
}

export function BuyerInfoCard({
  buyerId, loanCount, totalUpb,
}: {
  buyerId: string;
  loanCount: number;
  totalUpb: number;
}) {
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
    <div className={cn("rounded-xl border bg-white p-3 shadow-sm", colors.border)}>
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

      {entry.type === "bank" && entry.fdicSearchName ? (
        <div className={cn("rounded-lg border p-2", colors.border, colors.bg)}>
          <div className="flex items-center gap-1 mb-1">
            <ExternalLink className={cn("h-2.5 w-2.5 shrink-0", colors.text)} />
            <span className={cn("text-[9px] font-bold uppercase tracking-wider", colors.text)}>
              FDIC Call Report
            </span>
          </div>
          <FdicData entry={entry} />
        </div>
      ) : (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
          <p className="text-[10px] text-slate-400">
            {entry.type === "credit_union" ? "NCUA-regulated · not FDIC-insured" : "State-regulated · not FDIC-insured"}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">HQ: {entry.hq}</p>
        </div>
      )}
    </div>
  );
}

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
