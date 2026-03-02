import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart2,
  Layers,
  List,
  FileBarChart,
  ChevronDown,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { steps } from "@/app/steps";
import { Tooltip } from "@/components/ui/Tooltip";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";

const STEP_ICONS: Record<string, typeof MapPin> = {
  "1": MapPin,
  "2": Search,
  "3": CreditCard,
  "4": DollarSign,
  "5": TrendingUp,
  "6a": PieChart,
  "6b": BarChart2,
  "6c": Layers,
  "7": List,
  "8": FileBarChart,
};

export function Sidebar({
  collapsed,
  onToggle,
  forceShow,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  forceShow?: boolean;
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[1000] flex h-screen flex-col border-r transition-all duration-300 shadow-none",
        !forceShow && "hidden lg:flex",
        collapsed
          ? "w-[72px] bg-sky-600 border-sky-500"
          : "w-[260px] border-white/50 bg-white/30 backdrop-blur-xl shadow-[4px_0_24px_rgba(56,189,248,0.08)]"
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        "flex h-14 items-center justify-between border-b px-4",
        collapsed ? "border-sky-500 justify-center" : "border-white/40"
      )}>
        {!collapsed && (
          <Link to="/" className="flex items-center justify-center -ml-1">
            <SprinkleXLogo size="md" showText={true} />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "rounded-lg p-2 transition-colors",
            collapsed
              ? "text-white hover:bg-sky-500"
              : "text-sky-600 hover:bg-sky-100"
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          {!collapsed && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sky-700/60 letter-spacing-widest"
            >
              Main Menu
              <ChevronDown className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")} />
            </button>
          )}
          {menuOpen && (
            <ul className="mt-1 space-y-0.5">
              {steps.map((step) => {
                const Icon = STEP_ICONS[step.id] ?? LayoutDashboard;
                const isActive = location.pathname === step.path;
                return (
                  <li key={step.id}>
                    <Tooltip content={step.tooltip ?? step.headerTitle.replace(/^Step \d+\w? - /, "")} wrapperClassName="w-full [&>a]:w-full">
                      <Link
                        to={step.path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          collapsed
                            ? isActive
                              ? "text-white justify-center"
                              : "text-white/60 hover:bg-white/10 hover:text-white/90 justify-center"
                            : isActive
                              ? "bg-white/80 text-sky-800 shadow-sm ring-1 ring-sky-200/80"
                              : "text-sky-900/55 hover:bg-sky-100/70 hover:text-sky-800"
                        )}
                      >
                        <Icon
                          className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-yellow-400" : "")}
                          strokeWidth={2}
                        />
                        {!collapsed && (
                          <span className="truncate">{step.headerTitle.replace(/^Step \d+\w? - /, "")}</span>
                        )}
                      </Link>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
}
