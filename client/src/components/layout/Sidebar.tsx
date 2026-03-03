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
  Upload,
  Settings,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { steps } from "@/app/steps";
import { Tooltip } from "@/components/ui/Tooltip";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";

const STEP_ICONS: Record<string, typeof MapPin> = {
  "1":  MapPin,
  "2":  Search,
  "3":  CreditCard,
  "4":  DollarSign,
  "5":  TrendingUp,
  "6a": PieChart,
  "6b": BarChart2,
  "6c": Layers,
  "7":  List,
  "8":  FileBarChart,
  "9":  Layers,
};

const ADMIN_NAV = [
  { path: "/admin/tape-import", label: "Tape Import", icon: Upload, tooltip: "Upload & map seller tape CSV files" },
];

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
  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[1000] flex h-screen flex-col border-r transition-all duration-300",
        !forceShow && "hidden lg:flex",
        collapsed
          ? "w-[72px] bg-sky-600 border-sky-500"
          : "w-[220px] border-slate-200 bg-white shadow-sm"
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center justify-between border-b px-4",
        collapsed ? "h-14 border-sky-500 justify-center" : "h-[72px] border-slate-200"
      )}>
        {!collapsed && (
          <Link to="/" className="flex items-center -ml-1">
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
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
              data-tour="sidebar-main-menu"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sky-700/60"
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
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                          collapsed
                            ? isActive
                              ? "text-white justify-center"
                              : "text-white/60 hover:bg-white/10 hover:text-white/90 justify-center"
                            : isActive
                              ? "bg-amber-50 text-slate-800"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <Icon
                          className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-amber-400" : "text-slate-400")}
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

        {/* Bank Call Report */}
        <div className="mt-2 px-3">
          {(() => {
            const isActive = location.pathname === "/bank-call-report";
            return (
              <Tooltip content="Search FDIC bank call report data" wrapperClassName="w-full [&>a]:w-full">
                <Link
                  to="/bank-call-report"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    collapsed
                      ? isActive
                        ? "text-white justify-center"
                        : "text-white/60 hover:bg-white/10 hover:text-white/90 justify-center"
                      : isActive
                        ? "bg-amber-50 text-slate-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Landmark
                    className={cn("h-4 w-4 shrink-0", isActive ? "text-amber-400" : "text-slate-400")}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">Bank Call Report</span>}
                </Link>
              </Tooltip>
            );
          })()}
        </div>

        {/* Admin Section */}
        <div className="mt-4 px-3">
          {!collapsed && (
            <button
              data-tour="sidebar-admin"
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sky-700/60"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5" /> Admin
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", adminOpen && "rotate-180")} />
            </button>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <Settings className="h-4 w-4 text-white/40" />
            </div>
          )}
          {adminOpen && (
            <ul className="mt-1 space-y-0.5">
              {ADMIN_NAV.map(({ path, label, icon: Icon, tooltip }) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path}>
                    <Tooltip content={tooltip} wrapperClassName="w-full [&>a]:w-full">
                      <Link
                        to={path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                          collapsed
                            ? isActive
                              ? "text-white justify-center"
                              : "text-white/60 hover:bg-white/10 hover:text-white/90 justify-center"
                            : isActive
                              ? "bg-amber-50 text-slate-800"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <Icon
                          className={cn("h-4 w-4 shrink-0", isActive ? "text-amber-400" : "text-slate-400")}
                          strokeWidth={2}
                        />
                        {!collapsed && <span className="truncate">{label}</span>}
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
