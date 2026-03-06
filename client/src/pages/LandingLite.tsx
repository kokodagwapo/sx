import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Globe, LayoutList, Search, Scale, ListChecks, Mic, Volume2, Loader2 } from "lucide-react";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { AppearingDots } from "@/components/backgrounds/AppearingDots";
import { assistantLoanSearch, cohiTts } from "@/api/assistant";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

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

function Stat({
  label,
  value,
  className,
  loading,
  animate,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = "",
  skeletonClassName = "w-20",
}: {
  label: string;
  value: number;
  className?: string;
  loading: boolean;
  animate: boolean;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  skeletonClassName?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl px-4 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.06)]", className)}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900 [font-family:var(--font-display)] tabular-nums">
        {loading ? (
          <span className={cn("inline-block h-5 rounded bg-slate-200/70 animate-pulse align-middle", skeletonClassName)} />
        ) : (
          <span>
            {prefix}
            {animate ? (
              <AnimatedCounter value={value} duration={duration} decimals={decimals} />
            ) : (
              <AnimatedCounter value={value} duration={0} decimals={decimals} />
            )}
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandingLite() {
  useEffect(() => {
    document.body.classList.add("sx-body-transparent");
    return () => document.body.classList.remove("sx-body-transparent");
  }, []);
  const { data, isLoading } = useQuery({
    queryKey: ["/api/portfolio/stats"],
    queryFn: fetchPortfolioStats,
    staleTime: 5 * 60 * 1000,
  });
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantErr, setAssistantErr] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  const upbM = upb / 1_000_000;

  // Slow “simulation” reveal on first load (even if network is fast)
  const [statsReveal, setStatsReveal] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setStatsReveal(true), 520);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      {/* Celestial background (white base + dots) */}
      <div className="absolute inset-0">
        {/* soft color blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-[360px] w-[360px] sm:-top-32 sm:-left-32 sm:h-[520px] sm:w-[520px] rounded-full bg-slate-100/65 blur-3xl sx-float-1" />
        <div className="pointer-events-none absolute -top-28 right-[-160px] h-[420px] w-[420px] sm:-top-40 sm:right-[-180px] sm:h-[560px] sm:w-[560px] rounded-full bg-slate-100/55 blur-3xl sx-float-2" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[8%] h-[420px] w-[420px] sm:bottom-[-220px] sm:left-[20%] sm:h-[560px] sm:w-[560px] rounded-full bg-slate-50/70 blur-3xl sx-float-3" />
        <FlickeringGrid
          className="absolute inset-0 size-full opacity-[0.92] filter contrast-125 saturate-125"
          squareSize={5}
          gridGap={6}
          // Neutral-first palette for a white/clean base with subtle color pops
          colors={["#94a3b8", "#1D77C3", "#2dd4bf", "#4E9A4B", "#a78bfa", "#f59e0b"]}
          maxOpacity={0.22}
          flickerChance={0.05}
          blendSpeed={0.58}
          timeScale={0.3}
          mouseRepel={true}
          mouseRadius={220}
          mouseForce={28}
        />
        <AppearingDots
          className="opacity-90"
          count={55}
          minRadius={1.2}
          maxRadius={3.5}
          cycleMsMin={10000}
          cycleMsMax={22000}
          maxAlpha={0.42}
        />

        {/* Subtle “web” elements */}
        <svg
          className="hidden md:block absolute left-[6%] top-[18%] w-[360px] h-[240px] opacity-[0.22] sx-float-2"
          viewBox="0 0 360 240"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="url(#g1)" strokeWidth="1">
            <path d="M22 160 L110 108 L196 138 L304 70" />
            <path d="M110 108 L144 42 L196 138" />
            <path d="M196 138 L238 198 L334 176" />
          </g>
          <g>
            {[
              { x: 22, y: 160, c: "#1D77C3" },
              { x: 110, y: 108, c: "#2dd4bf" },
              { x: 144, y: 42, c: "#4E9A4B" },
              { x: 196, y: 138, c: "#1D77C3" },
              { x: 238, y: 198, c: "#4E9A4B" },
              { x: 304, y: 70, c: "#2dd4bf" },
              { x: 334, y: 176, c: "#1D77C3" },
            ].map((n, i) => (
              <g key={i} className={i % 2 === 0 ? "sx-pulse-soft" : ""}>
                <circle cx={n.x} cy={n.y} r="4.5" fill={n.c} fillOpacity="0.55" />
                <circle cx={n.x} cy={n.y} r="2.2" fill="#ffffff" fillOpacity="0.85" />
              </g>
            ))}
          </g>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="360" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1D77C3" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#2dd4bf" stopOpacity="0.6" />
              <stop offset="1" stopColor="#4E9A4B" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="hidden md:block absolute right-[8%] top-[20%] sx-float-1">
          <div className="sx-surface rounded-2xl px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_10px_30px_rgba(2,6,23,0.10)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2dd4bf] sx-pulse-soft" />
              Live filters
            </span>
          </div>
        </div>
        <div className="hidden md:block absolute right-[12%] top-[34%] sx-float-3">
          <div className="sx-surface rounded-2xl px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_10px_30px_rgba(2,6,23,0.10)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4E9A4B] sx-pulse-soft" />
              Verified tapes
            </span>
          </div>
        </div>

        {/* (removed) vignette overlay so background animation stays visible */}

      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 sm:px-6 py-8 sm:py-10 min-h-screen flex flex-col text-slate-900 [font-family:var(--font-sans)]">
        <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 sm:gap-4 sx-fade-rise sx-fade-rise-1">
          <div className="flex items-center gap-3">
            <SprinkleXLogo size="md" showText />
            <span className="hidden sm:inline text-[10px] font-medium tracking-[0.22em] uppercase text-slate-400">
              Seasoned Whole Loan Exchange
            </span>
          </div>
          <Link
            to="/login?returnTo=%2Fstep%2F1"
            className="sx-hover-brighten-control inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl border border-sky-200/70 bg-sky-100/35 backdrop-blur-2xl px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-sky-100/45"
          >
            <span className="[font-family:var(--font-display)] tracking-tight">Open dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 sm:mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="sx-fade-rise sx-fade-rise-2">
            <h1
              className="text-[clamp(26px,3.8vw,48px)] font-bold tracking-[-0.04em] leading-[1.12] [font-family:var(--font-display)] [text-wrap:balance]"
            >
              A{" "}
              <span className="bg-gradient-to-r from-[#1D77C3] via-[#4E9A4B] to-[#90D348] bg-clip-text text-transparent font-extrabold tracking-[-0.045em]">
                Seasoned Whole Loan
              </span>{" "}
              Exchange
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15px] sm:text-[16px] leading-[1.6] text-slate-600 [text-wrap:pretty] [font-family:var(--font-sans)]">
              A digital marketplace where lenders trade seasoned whole loans that have proven performance histories, enabling smarter liquidity, risk, and portfolio management.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-wide text-slate-600 uppercase">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur border border-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1D77C3]" />
                Liquidity
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur border border-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4E9A4B]" />
                Risk
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur border border-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#90D348]" />
                Portfolio
              </span>
            </div>
            </div>
          </div>

          <div className="grid gap-3 sx-fade-rise sx-fade-rise-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-4 w-1.5 rounded-full bg-gradient-to-b from-[#1D77C3] via-[#4E9A4B] to-[#90D348] sx-pulse-soft" />
                {isLoading ? "Loading portfolio stats…" : "Portfolio snapshot"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="sx-fade-rise sx-fade-rise-1">
                <Stat
                  label="Loans"
                  value={loans}
                  loading={!statsReveal || isLoading}
                  animate={statsReveal}
                  duration={2100}
                  skeletonClassName="w-16"
                />
              </div>
              <div className="sx-fade-rise sx-fade-rise-2">
                <Stat
                  label="Total UPB"
                  value={upbM}
                  loading={!statsReveal || isLoading}
                  animate={statsReveal}
                  duration={2300}
                  decimals={1}
                  prefix="$"
                  suffix="M"
                  skeletonClassName="w-24"
                />
              </div>
              <div className="sx-fade-rise sx-fade-rise-3">
                <Stat
                  label="WA Rate"
                  value={waRate}
                  loading={!statsReveal || isLoading}
                  animate={statsReveal}
                  duration={2400}
                  decimals={2}
                  suffix="%"
                  skeletonClassName="w-16"
                />
              </div>
              <div className="sx-fade-rise sx-fade-rise-3">
                <Stat
                  label="WA FICO"
                  value={waFico}
                  loading={!statsReveal || isLoading}
                  animate={statsReveal}
                  duration={2000}
                  skeletonClassName="w-14"
                />
              </div>
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
            if (!q) return;
            setAssistantErr(null);
            setAssistantLoading(true);
            assistantLoanSearch(q)
              .then((r) => {
                setAssistantAnswer(r.answer);
              })
              .catch((err) => {
                setAssistantErr(String(err?.message ?? "Assistant failed"));
              })
              .finally(() => setAssistantLoading(false));
          }}
          className="mt-10 sm:mt-14 lg:mt-[144px]"
        >
          <div className="mx-auto w-full max-w-[900px] sx-floating">
            <div className="relative sx-surface rounded-[26px] p-3 sm:p-4">
              {/* pastel aura behind the panel */}
              <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[34px] bg-gradient-to-r from-sky-200/16 via-emerald-200/12 to-violet-200/14 blur-xl" />

              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
                <Link
                  to="/step/2"
                  className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full border border-sky-200/50 bg-sky-100/50 px-3 py-1 backdrop-blur text-sky-800 hover:bg-sky-100/70"
                >
                  <LayoutList className="h-3.5 w-3.5 text-sky-700" />
                  Loan Search
                </Link>
                <Link
                  to="/step/1"
                  className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-emerald-100/45 px-3 py-1 backdrop-blur text-emerald-800 hover:bg-emerald-100/65"
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-700" />
                  Geographic
                </Link>
                <Link
                  to="/marketplace"
                  className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full border border-violet-200/50 bg-violet-100/45 px-3 py-1 backdrop-blur text-violet-800 hover:bg-violet-100/65"
                >
                  <Building2 className="h-3.5 w-3.5 text-violet-700" />
                  Marketplace
                </Link>
                <Link
                  to="/step/4"
                  className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-amber-100/50 px-3 py-1 backdrop-blur text-amber-900 hover:bg-amber-100/70"
                >
                  <Scale className="h-3.5 w-3.5 text-amber-700" />
                  Pricing
                </Link>
                <Link
                  to="/step/7"
                  className="sx-hover-brighten-control inline-flex items-center gap-1.5 rounded-full border border-rose-200/50 bg-rose-100/45 px-3 py-1 backdrop-blur text-rose-900 hover:bg-rose-100/65"
                >
                  <ListChecks className="h-3.5 w-3.5 text-rose-700" />
                  Schedule
                </Link>
              </div>

              <div className="sx-hover-brighten flex flex-col sm:flex-row sm:items-center items-stretch gap-2 sm:gap-3 rounded-2xl border border-white/45 bg-white/15 backdrop-blur-2xl px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 self-start sm:self-auto">
                <Search className="h-4 w-4" strokeWidth={2} />
              </div>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder}
                className="min-w-0 w-full flex-1 bg-transparent px-1 py-2 text-sm text-slate-950 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SR) return;
                  const rec = new SR();
                  rec.lang = "en-US";
                  rec.interimResults = false;
                  rec.maxAlternatives = 1;
                  setListening(true);
                  rec.onresult = (ev: any) => {
                    const text = ev.results?.[0]?.[0]?.transcript ?? "";
                    if (text) setPrompt(text);
                  };
                  rec.onend = () => setListening(false);
                  rec.onerror = () => setListening(false);
                  rec.start();
                }}
                className={cn(
                  "sx-hover-brighten-control inline-flex h-9 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/15 backdrop-blur-2xl px-3 text-sm font-semibold text-slate-800",
                  listening && "opacity-70"
                )}
                title="Voice input"
              >
                {listening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                <span className="sm:hidden">Voice</span>
              </button>
              <button
                type="submit"
                disabled={!prompt.trim() || assistantLoading}
                className={cn(
                  "sx-hover-brighten-control inline-flex h-9 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-200/60 bg-sky-200/20 backdrop-blur-2xl px-3.5 text-sm font-semibold text-sky-900 shadow-[0_10px_30px_rgba(29,119,195,0.10)] hover:bg-sky-200/28",
                  (!prompt.trim() || assistantLoading) && "opacity-60"
                )}
              >
                {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
              {(assistantAnswer || assistantErr) && (
                <div className="mt-3 rounded-2xl border border-white/50 bg-white/25 backdrop-blur-2xl px-3 py-2 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assistant</div>
                      <div className="mt-1 text-[13px] leading-relaxed">
                        {assistantErr ? assistantErr : assistantAnswer}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!assistantAnswer) return;
                          try {
                            setSpeaking(true);
                            const blob = await cohiTts(assistantAnswer);
                            const url = URL.createObjectURL(blob);
                            if (!audioRef.current) audioRef.current = new Audio();
                            audioRef.current.src = url;
                            audioRef.current.onended = () => {
                              setSpeaking(false);
                              URL.revokeObjectURL(url);
                            };
                            await audioRef.current.play();
                          } catch {
                            setSpeaking(false);
                          }
                        }}
                        className={cn(
                          "sx-hover-brighten-control inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-2xl text-slate-700",
                          speaking && "opacity-70"
                        )}
                        title="Play voice"
                      >
                        {speaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const q = prompt.trim();
                          navigate(q ? `/step/2?q=${encodeURIComponent(q)}` : "/step/2");
                        }}
                        className="sx-hover-brighten-control hidden sm:inline-flex h-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-2xl px-3 text-[12px] font-semibold text-slate-700"
                      >
                        Open results
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-2 text-center text-[11px] text-slate-400">
                Tip: press Enter to search. Results load in batches.
              </div>
            </div>
          </div>
        </form>

        <div className="mt-auto pt-10 text-xs text-slate-400 text-center">
          Teraverde® Financial LLC. 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}

