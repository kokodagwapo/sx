import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  LayoutDashboard,
  Menu,
  Upload,
  Settings,
  Landmark,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { steps } from "@/app/steps";
import { prefetchStep } from "@/app/stepPrefetch";
import { Tooltip } from "@/components/ui/Tooltip";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { useAuth } from "@/context/AuthContext";

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
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[1000] flex h-screen flex-col border-r transition-all duration-300",
        !forceShow && "hidden lg:flex",
        collapsed
          ? "w-[72px] bg-sky-600 border-sky-500"
          : forceShow
            ? "w-[260px] border-white/50 bg-white shadow-xl"
            : "w-[220px] border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center justify-between border-b px-4",
        collapsed ? "h-14 border-sky-500 justify-center" : "h-14 border-slate-100 bg-white/60"
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
            "sx-hover-brighten-control rounded-lg p-2 transition-colors",
            collapsed
              ? "text-amber-400 hover:bg-sky-500 animate-pulse"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          )}
        >
          {forceShow ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-3">
          {!collapsed && (
            <button
              data-tour="sidebar-main-menu"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            >
              Portfolio
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", menuOpen && "rotate-180")} />
            </button>
          )}
          {menuOpen && (
            <ul className="mt-0.5 space-y-px">
              {steps.map((step) => {
                const Icon = STEP_ICONS[step.id] ?? LayoutDashboard;
                const isActive = location.pathname === step.path;
                return (
                  <li key={step.id}>
                    <Tooltip content={step.tooltip ?? step.headerTitle.replace(/^Step \d+\w? - /, "")} wrapperClassName="w-full [&>a]:w-full">
                      <Link
                        to={step.path}
                        onMouseEnter={() => prefetchStep(step.path)}
                        className={cn(
                          "sx-hover-brighten-control flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                          collapsed
                            ? isActive
                              ? "justify-center bg-white/25"
                              : "justify-center hover:bg-white/15"
                            : isActive
                              ? "bg-sky-50 text-sky-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            collapsed
                              ? isActive ? "text-white" : "text-white/80"
                              : isActive ? "text-sky-500" : "text-slate-400"
                          )}
                          strokeWidth={1.5}
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

        <div className="my-2 mx-3 border-t border-slate-100" />

        {/* Bank Call Report */}
        <div className="px-3">
          {(() => {
            const isActive = location.pathname === "/bank-call-report";
            return (
              <Tooltip content="Search FDIC bank call report data" wrapperClassName="w-full [&>a]:w-full">
                <Link
                  to="/bank-call-report"
                  className={cn(
                    "sx-hover-brighten-control flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                    collapsed
                      ? isActive
                        ? "justify-center bg-white/25"
                        : "justify-center hover:bg-white/15"
                      : isActive
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <Landmark
                    className={cn(
                      "h-4 w-4 shrink-0",
                      collapsed
                        ? isActive ? "text-white" : "text-white/80"
                        : isActive ? "text-sky-500" : "text-slate-400"
                    )}
                    strokeWidth={1.5}
                  />
                  {!collapsed && <span className="truncate">Bank Call Report</span>}
                </Link>
              </Tooltip>
            );
          })()}
        </div>

        <div className="my-2 mx-3 border-t border-slate-100" />

        {/* Admin Section */}
        <div className="px-3">
          {!collapsed && (
            <button
              data-tour="sidebar-admin"
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            >
              Admin
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", adminOpen && "rotate-180")} />
            </button>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <Settings className="h-4 w-4 text-white" />
            </div>
          )}
          {adminOpen && (
            <ul className="mt-0.5 space-y-px">
              {ADMIN_NAV.map(({ path, label, icon: Icon, tooltip }) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path}>
                    <Tooltip content={tooltip} wrapperClassName="w-full [&>a]:w-full">
                      <Link
                        to={path}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                          collapsed
                            ? isActive
                              ? "justify-center bg-white/25"
                              : "justify-center hover:bg-white/15"
                            : isActive
                              ? "bg-sky-50 text-sky-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            collapsed
                              ? isActive ? "text-white" : "text-white/80"
                              : isActive ? "text-sky-500" : "text-slate-400"
                          )}
                          strokeWidth={1.5}
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

        {user && !collapsed && (
          <div className="mt-auto border-t border-slate-100 px-3 py-3">
            <button
              type="button"
              onClick={() => { logout(); nav("/"); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">Sign out</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
