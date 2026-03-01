import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { search, type SearchResult } from "@/app/searchIndex";

export function StepHeader({
  title,
  prevHref,
  nextHref,
  className,
}: {
  title: string;
  prevHref?: string;
  nextHref?: string;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setResults(search(searchQuery));
    setHighlighted(0);
  }, [searchQuery]);

  useEffect(() => {
    if (focused && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect(rect);
    } else {
      setDropdownRect(null);
    }
  }, [focused, searchQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!focused || results.length === 0) return;
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
        setFocused(false);
        inputRef.current?.blur();
      } else if (e.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focused, results, highlighted, navigate]);

  const showDropdown = focused && searchQuery.trim().length > 0;

  const dropdownContent = showDropdown && dropdownRect && (
    <div
      ref={dropdownRef}
      className="fixed max-h-64 overflow-auto rounded-lg border border-slate-200/80 bg-white/95 py-1 shadow-xl backdrop-blur-xl"
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
              setFocused(false);
            }}
            className={cn(
              "block px-4 py-2.5 text-sm text-slate-700 transition-colors",
              i === highlighted ? "bg-sky-50/80 text-sky-800" : "hover:bg-slate-50/80"
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
    <div
      className={cn(
        "relative z-[9999] border-b border-slate-200/60",
        "bg-white/70 backdrop-blur-xl shadow-sm",
        className,
      )}
    >
      <div className="container-page flex h-14 items-center gap-4">
        <div className="min-w-0 shrink-0">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-slate-800 [font-family:var(--font-display)]">
            {title}
          </h1>
        </div>

        {/* Search box */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search data, sections, routes..."
              className="w-full rounded-lg border border-slate-200/80 bg-white/80 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/50"
            />
          </div>
          {dropdownContent && createPortal(dropdownContent, document.body)}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderIconLink to="/" title="Home">
            <Home className="h-4 w-4" />
          </HeaderIconLink>
          <div className="h-5 w-px bg-slate-200/80" />
          <HeaderIconLink disabled={!prevHref} to={prevHref}>
            <ChevronLeft className="h-4 w-4" />
          </HeaderIconLink>
          <HeaderIconLink disabled={!nextHref} to={nextHref}>
            <ChevronRight className="h-4 w-4" />
          </HeaderIconLink>
          <HeaderIconLink disabled to={undefined} title="Close (mock)">
            <X className="h-4 w-4" />
          </HeaderIconLink>
        </div>
      </div>
    </div>
  );
}

function HeaderIconLink({
  to,
  children,
  disabled,
  title,
}: {
  to?: string;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  const cls =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200/80 bg-slate-50/80 text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800 active:scale-95";
  if (!to || disabled) {
    return (
      <span className={cn(cls, "opacity-50 cursor-not-allowed")} title={title}>
        {children}
      </span>
    );
  }
  return (
    <Link className={cls} to={to} title={title}>
      {children}
    </Link>
  );
}
