import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Globe, LayoutList, Search } from "lucide-react";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { cn } from "@/lib/utils";
import { CelestialDots } from "@/components/backgrounds/CelestialDots";

type PortfolioStats = {
  totalLoans: number;
  totalUpb: number;
  waRate?: number;
  waFico?: number;
  waLtv?: number;
  waDti?: number;
};

async function fetchPortfolioStats(): Promise<PortfolioStats> {
  const res = await fetch("/api/portfolio/stats");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as PortfolioStats;
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl px-4 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.06)]", className)}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-slate-800 [font-family:var(--font-display)] tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function LandingLite() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/portfolio/stats"],
    queryFn: fetchPortfolioStats,
    staleTime: 5 * 60 * 1000,
  });
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const placeholderExamples = useMemo(
    () => [
      "Find loans in California under 80% LTV",
      "Show jumbo loans with FICO above 760",
      "Search loans from Provident in FL",
    ],
    [],
  );
  const placeholder = placeholderExamples[0];

  const loans = data?.totalLoans ?? 7050;
  const upb = data?.totalUpb ?? 1_861_333_635;
  const waRate = data?.waRate ?? 3.50;
  const waFico = data?.waFico ?? 744;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Celestial background (white base + dots) */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft color blobs */}
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute -top-40 right-[-180px] h-[560px] w-[560px] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[20%] h-[560px] w-[560px] rounded-full bg-teal-200/25 blur-3xl" />
        <CelestialDots className="opacity-[0.95]" />
        {/* gentle vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(255,255,255,0),rgba(255,255,255,0.78)_70%,rgba(255,255,255,0.92))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SprinkleXLogo size="md" showText />
            <span className="hidden sm:inline text-[10px] font-medium tracking-[0.22em] uppercase text-slate-400">
              Portfolio Analytics
            </span>
          </div>
          <Link
            to="/step/1"
            className="sx-hover-brighten-control inline-flex items-center gap-2 rounded-xl bg-[#007B8A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#006775]"
          >
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h1 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.03em] leading-[1.06] text-slate-900 [font-family:var(--font-display)]">
              Buy and sell{" "}
              <span className="bg-gradient-to-r from-[#007B8A] via-[#2dd4bf] to-[#4E9A4B] bg-clip-text text-transparent">
                loan pools
              </span>{" "}
              in minutes.
            </h1>
            <p className="mt-3 max-w-[62ch] text-sm sm:text-[15px] leading-relaxed text-slate-600">
              A simple marketplace for loan buyers and sellers—search, compare, and price in one place.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#007B8A]" />
                Built for buyers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4E9A4B]" />
                Built for sellers
              </span>
              <span className="hidden sm:inline text-slate-400">
                No noise. Just deals.
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-4 w-1.5 rounded-full bg-gradient-to-b from-[#007B8A] via-[#2dd4bf] to-[#4E9A4B]" />
                {isLoading ? "Loading portfolio stats…" : "Portfolio snapshot"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Loans" value={Intl.NumberFormat("en-US").format(loans)} />
              <Stat label="Total UPB" value={`$${(upb / 1_000_000).toFixed(1)}M`} />
              <Stat label="WA Rate" value={`${waRate.toFixed(2)}%`} />
              <Stat label="WA FICO" value={String(waFico)} />
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl px-4 py-3 text-xs text-slate-500">
              Tip: hover step links in the sidebar to prefetch the next step chunk.
            </div>
          </div>
        </div>

        {/* ChatGPT-style prompt box — bottom of hero */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = prompt.trim();
            navigate(q ? `/step/2?q=${encodeURIComponent(q)}` : "/step/2");
          }}
          className="mt-[240px]"
        >
          <div className="mx-auto max-w-[900px] sx-floating">
            <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
              <Link
                to="/step/2"
                className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full bg-white/35 px-3 py-1 backdrop-blur hover:bg-white/50 hover:text-slate-700"
              >
                <LayoutList className="h-3.5 w-3.5 text-sky-600" />
                Loan Search
              </Link>
              <Link
                to="/step/1"
                className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full bg-white/35 px-3 py-1 backdrop-blur hover:bg-white/50 hover:text-slate-700"
              >
                <Globe className="h-3.5 w-3.5 text-sky-600" />
                Geographic
              </Link>
              <Link
                to="/marketplace"
                className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 backdrop-blur hover:bg-white/45 hover:text-slate-700"
              >
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                Marketplace
              </Link>
            </div>

            <div className="sx-surface sx-hover-brighten flex items-center gap-3 rounded-2xl px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Search className="h-4 w-4" strokeWidth={2} />
              </div>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className={cn(
                  "sx-hover-brighten-control inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-sky-600 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700",
                  !prompt.trim() && "bg-slate-400 hover:bg-slate-500"
                )}
              >
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-center text-[11px] text-slate-400">
              Tip: press Enter to search. Results load in batches.
            </div>
          </div>
        </form>

        <div className="mt-auto pt-10 text-xs text-slate-400">
          Teraverde® Financial LLC. 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}

