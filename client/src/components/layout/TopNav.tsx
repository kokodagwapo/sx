import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User, ChevronDown, Menu, ChevronLeft, ChevronRight, FileUp, AlertTriangle, Info, TrendingUp, CheckCircle2, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { search, type SearchResult } from "@/app/searchIndex";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { Tooltip } from "@/components/ui/Tooltip";
import { steps, getPrevNext, type StepId } from "@/app/steps";
import { UploadModal } from "@/components/importExport/UploadModal";
import { useLoanContext } from "@/context/LoanContext";
import { useTour } from "@/context/TourContext";
import { TourBubble } from "@/components/onboarding/TourBubble";

type Notif = {
  id: string;
  type: "alert" | "info" | "market" | "success";
  title: string;
  body: string;
  time: string;
  link?: string;
};

const NOTIFICATIONS: Notif[] = [
  {
    id: "n1",
    type: "alert",
    title: "High Flood-Risk Concentration",
    body: "23% of portfolio UPB sits in FEMA High flood-risk zones. Review exposure on Step 1 → Flood Risk layer.",
    time: "2 min ago",
    link: "/step/1",
  },
  {
    id: "n2",
    type: "alert",
    title: "CA Concentration Exceeds 20%",
    body: "California now represents 21.4% of total UPB ($187M). Consider geographic diversification.",
    time: "18 min ago",
    link: "/step/1",
  },
  {
    id: "n3",
    type: "market",
    title: "30-Yr Rate Moved +12 bps",
    body: "Conventional 30-year rate rose to 6.82%. Refinance pipeline may compress — check cohort prepay speeds.",
    time: "1 hr ago",
    link: "/step/9",
  },
  {
    id: "n4",
    type: "info",
    title: "87 Loans Approaching Commitment Expiry",
    body: "87 Committed loans have estimated expiry within 14 days. Review on Step 2 → Committed drilldown.",
    time: "3 hr ago",
    link: "/step/2",
  },
  {
    id: "n5",
    type: "success",
    title: "Portfolio Tape Processed",
    body: "6,215 loans imported successfully. All steps updated with the latest data.",
    time: "Yesterday",
  },
  {
    id: "n6",
    type: "info",
    title: "LLPA Pricing Updated",
    body: "Teraverde indicative pricing grid refreshed for Q2 2026. Review adjusted margins on Step 4.",
    time: "Yesterday",
    link: "/step/4",
  },
];

const NOTIF_ICON: Record<Notif["type"], typeof AlertTriangle> = {
  alert:   AlertTriangle,
  info:    Info,
  market:  TrendingUp,
  success: CheckCircle2,
};

const NOTIF_STYLE: Record<Notif["type"], { icon: string; badge: string; dot: string }> = {
  alert:   { icon: "text-red-500",    badge: "bg-red-50   border-red-200/60",    dot: "bg-red-500"     },
  info:    { icon: "text-sky-500",    badge: "bg-sky-50   border-sky-200/60",    dot: "bg-sky-500"     },
  market:  { icon: "text-violet-500", badge: "bg-violet-50 border-violet-200/60", dot: "bg-violet-500"  },
  success: { icon: "text-emerald-500",badge: "bg-emerald-50 border-emerald-200/60", dot: "bg-emerald-500" },
};

/** Step nav items: 1–9, with 6 mapping to 6a */
const STEP_NAV: { num: number; stepId: StepId }[] = [
  { num: 1, stepId: "1" },
  { num: 2, stepId: "2" },
  { num: 3, stepId: "3" },
  { num: 4, stepId: "4" },
  { num: 5, stepId: "5" },
  { num: 6, stepId: "6a" },
  { num: 7, stepId: "7" },
  { num: 8, stepId: "8" },
  { num: 9, stepId: "9" },
];

function currentStepId(pathname: string): StepId | null {
  const step = steps.find((s) => pathname === s.path || pathname.startsWith(s.path + "/"));
  return step?.id ?? null;
}

export function TopNav({
  title,
  onMenuClick,
}: {
  title: string;
  sidebarCollapsed?: boolean;
  onMenuClick?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const { setImportedLoans, importedLoans } = useLoanContext();
  const { restartTour } = useTour();
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = NOTIFICATIONS.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));

  const dismissNotif = (id: string) =>
    setReadIds((prev) => new Set([...Array.from(prev), id]));

  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);
  const navigate = useNavigate();
  const location = useLocation();
  const currentStep = currentStepId(location.pathname);
  const { prev, next } = getPrevNext(currentStep ?? "1");

  useEffect(() => {
    setResults(search(searchQuery));
    setHighlighted(0);
  }, [searchQuery]);

  useEffect(() => {
    if (searchFocused && inputRef.current) {
      setDropdownRect(inputRef.current.getBoundingClientRect());
    } else {
      setDropdownRect(null);
    }
  }, [searchFocused, searchQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!searchFocused || results.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[highlighted]) {
        e.preventDefault();
        navigate(results[highlighted].path);
        setSearchQuery("");
        setSearchFocused(false);
        inputRef.current?.blur();
      } else if (e.key === "Escape") {
        setSearchFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchFocused, results, highlighted, navigate]);

  const showDropdown = searchFocused && searchQuery.trim().length > 0;

  const dropdownContent = showDropdown && dropdownRect && (
    <div
      className="fixed max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
      style={{
        top: dropdownRect.bottom + 4,
        left: dropdownRect.left,
        width: dropdownRect.width,
        zIndex: 99999,
      }}
    >
      {results.length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-500">No matches</div>
      ) : (
        results.map((r, i) => (
          <Link
            key={r.path + r.title}
            to={r.path}
            onMouseEnter={() => setHighlighted(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setSearchQuery("");
              setSearchFocused(false);
            }}
            className={cn(
              "block px-4 py-2.5 text-sm transition-colors",
              i === highlighted ? "bg-sky-500/10 text-sky-600" : "text-slate-700 hover:bg-sky-50"
            )}
          >
            <div className="font-medium">{r.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">{r.path}</div>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-[999] flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 backdrop-blur-md transition-colors duration-300 shadow-none">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <Link to="/" className="hidden items-center gap-3 shrink-0 -ml-1">
          <SprinkleXLogo size="sm" showText />
        </Link>
        {/* Step stepper — permanent, no layout shift */}
        <nav
          className="ml-2 hidden items-center gap-0.5 sm:flex"
          aria-label="Step navigation"
        >
          {prev && (
            <Tooltip content={`Previous: ${prev.headerTitle}`} side="bottom">
              <Link
                to={prev.path}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Tooltip>
          )}
          <div data-tour="step-pills" className="flex items-center gap-0.5">
            {STEP_NAV.map(({ num, stepId }) => {
              const step = steps.find((s) => s.id === stepId)!;
              const isActive =
                currentStep === stepId ||
                (stepId === "6a" && (currentStep === "6b" || currentStep === "6c"));
              return (
                <Tooltip key={stepId} content={step.headerTitle} side="bottom">
                  <Link
                    to={step.path}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sky-500 text-white shadow-sm ring-2 ring-sky-500/20"
                        : "text-slate-500 hover:bg-sky-100 hover:text-sky-700 hover:scale-105 active:scale-95"
                    )}
                  >
                    {num}
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          {next && (
            <Tooltip content={`Next: ${next.headerTitle}`} side="bottom">
              <Link
                to={next.path}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Tooltip>
          )}
        </nav>
      </div>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#4285F4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20"
          />
        </div>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>

      {/* Right: Title, Notifications, Profile */}
      <div className="flex items-center gap-4">
        <h1 className="hidden text-base font-semibold text-slate-700 truncate max-w-[200px] sm:block sm:max-w-[240px] md:max-w-none">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <Tooltip content={importedLoans ? `${importedLoans.length.toLocaleString()} loans loaded · click to re-import` : "Upload loan tape (CSV / Excel)"} side="bottom">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className={cn(
                "relative rounded-lg p-2 transition-colors animate-glow-pulse",
                importedLoans
                  ? "text-sky-500 hover:bg-sky-50 hover:text-sky-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <FileUp className="h-5 w-5" strokeWidth={2} />
              {importedLoans && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-400" />
              )}
            </button>
          </Tooltip>
          <Tooltip content="Restart guided tour" side="bottom">
            <button
              type="button"
              onClick={restartTour}
              className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-500"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </Tooltip>
          <div data-tour="notif-bell" className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className={cn(
                "relative rounded-lg p-2 transition-colors",
                notifOpen
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <Bell className="h-5 w-5" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && createPortal(
              <div
                className="fixed z-[1100] w-96 rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.18)] overflow-hidden animate-fade-in-up"
                style={{ top: 60, right: 16 }}
                ref={notifRef}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-600" strokeWidth={2} />
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
                  {NOTIFICATIONS.map((n) => {
                    const isRead = readIds.has(n.id);
                    const Icon = NOTIF_ICON[n.type];
                    const style = NOTIF_STYLE[n.type];
                    const inner = (
                      <div
                        className={cn(
                          "group relative flex gap-3 px-4 py-3.5 transition-colors",
                          isRead ? "bg-white hover:bg-slate-50/70" : "bg-slate-50/60 hover:bg-slate-100/60"
                        )}
                      >
                        {/* Unread dot */}
                        {!isRead && (
                          <span className={cn("absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
                        )}
                        {/* Icon */}
                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border", style.badge)}>
                          <Icon className={cn("h-4 w-4", style.icon)} strokeWidth={2} />
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-xs font-semibold leading-snug", isRead ? "text-slate-600" : "text-slate-800")}>
                              {n.title}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissNotif(n.id); }}
                              className="shrink-0 rounded p-0.5 text-slate-200 opacity-0 group-hover:opacity-100 hover:text-slate-400 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{n.body}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{n.time}</p>
                          {n.link && (
                            <span className="mt-1 inline-block text-[10px] font-medium text-sky-600 group-hover:underline">
                              View →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                    return n.link ? (
                      <Link
                        key={n.id}
                        to={n.link}
                        onClick={() => { setNotifOpen(false); if (!isRead) dismissNotif(n.id); }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={n.id}>{inner}</div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center">
                  <p className="text-[10px] text-slate-400">Alerts refresh automatically based on portfolio data</p>
                </div>
              </div>,
              document.body,
            )}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white">
              <User className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-slate-800">Hey, Maylin</div>
              <div className="text-xs text-slate-500">Business Profile</div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={2} />
          </div>
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onImport={(loans) => { setImportedLoans(loans); setUploadOpen(false); }}
      />

      <TourBubble
        stepKey="layout"
        delay={600}
        position="top-left"
        steps={[
          {
            title: "Welcome to SprinkleX",
            body: "This is your loan analytics workspace. The left sidebar is your main navigation — let's take a quick tour so you know where everything lives.",
            icon: "lightbulb",
            target: "sidebar-main-menu",
          },
          {
            title: "Main Menu — 9 Analysis Steps",
            body: "The sidebar's Main Menu lists Steps 1–9, each covering a different lens: geography, loan search, credit, pricing, performance, cohorts, and more. Click the section header to collapse or expand it.",
            icon: "list",
            target: "sidebar-main-menu",
          },
          {
            title: "Admin Section",
            body: "Below Main Menu is the Admin section. Use Tape Import here to upload and map seller CSV tapes. The Admin header also collapses independently.",
            icon: "upload",
            target: "sidebar-admin",
          },
          {
            title: "Quick-Jump Step Pills",
            body: "The numbered pills in the top bar (1–9) let you jump between steps instantly without opening the sidebar. The active step is highlighted in blue.",
            icon: "chart",
            target: "step-pills",
          },
          {
            title: "Alerts & Portfolio Health",
            body: "The bell icon in the top-right shows live portfolio alerts — flood-risk concentration, rate moves, expiring commitments, and more. Click it any time to review.",
            icon: "bell",
            target: "notif-bell",
            cta: "Let's go",
          },
        ]}
      />
    </header>
  );
}
