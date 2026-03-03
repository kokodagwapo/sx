import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User, ChevronDown, Menu, ChevronLeft, ChevronRight, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { search, type SearchResult } from "@/app/searchIndex";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { Tooltip } from "@/components/ui/Tooltip";
import { steps, getPrevNext, type StepId } from "@/app/steps";
import { UploadModal } from "@/components/importExport/UploadModal";
import { useLoanContext } from "@/context/LoanContext";

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
  const { setImportedLoans, importedLoans } = useLoanContext();
  const inputRef = useRef<HTMLInputElement>(null);
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
          <div className="flex items-center gap-0.5">
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
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ef4444]" />
          </button>
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
    </header>
  );
}
