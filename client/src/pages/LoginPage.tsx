import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Building2, TrendingUp, User, Lock, Sparkles } from "lucide-react";
import { SprinkleXLogo } from "@/components/ui/SprinkleXLogo";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

const DEMO_ACCOUNTS = [
  { label: "Demo Buyer", username: "demo_buyer", role: "buyer" as UserRole, icon: TrendingUp, color: "sky" },
  { label: "Demo Seller", username: "demo_seller", role: "seller" as UserRole, icon: Building2, color: "emerald" },
];

export default function LoginPage() {
  const [step, setStep] = useState<"role" | "credentials">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/step/1";

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("credentials");
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    login(username.trim(), selectedRole!);
    navigate(returnTo, { replace: true });
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    login(account.username, account.role);
    navigate(returnTo, { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50/80">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-slate-100/65 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 right-[-160px] h-[420px] w-[420px] rounded-full bg-slate-100/55 blur-3xl" />
        <FlickeringGrid
          className="absolute inset-0 size-full opacity-[0.65]"
          squareSize={5}
          gridGap={6}
          colors={["#94a3b8", "#1D77C3", "#2dd4bf", "#4E9A4B"]}
          maxOpacity={0.15}
          flickerChance={0.03}
          blendSpeed={0.4}
          timeScale={0.2}
          mouseRepel={true}
          mouseRadius={180}
          mouseForce={22}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <SprinkleXLogo size="lg" showText />
          <p className="text-[13px] text-slate-500 font-medium tracking-wide">Seasoned Whole Loan Exchange</p>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            {step === "role" && (
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight text-center">
                  How are you using SprinkleX?
                </h2>
                <p className="mt-1.5 text-[13px] text-slate-500 text-center">
                  Select your role to personalize your experience
                </p>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("buyer")}
                    className="group flex items-center gap-4 rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 text-left transition-all hover:bg-sky-50/70 hover:border-sky-300/70 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 transition-colors group-hover:bg-sky-200/70">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-slate-900">Buyer</div>
                      <div className="text-[12px] text-slate-500 leading-snug">
                        Search, analyze, and price loan pools
                      </div>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-sky-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("seller")}
                    className="group flex items-center gap-4 rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 text-left transition-all hover:bg-emerald-50/70 hover:border-emerald-300/70 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 transition-colors group-hover:bg-emerald-200/70">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-slate-900">Seller</div>
                      <div className="text-[12px] text-slate-500 leading-snug">
                        List, manage, and track your loan portfolios
                      </div>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-emerald-500" />
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/60" />
                    </div>
                    <span className="relative bg-white/65 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                      Quick demo
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((acct) => {
                      const Icon = acct.icon;
                      return (
                        <button
                          key={acct.username}
                          type="button"
                          onClick={() => handleDemoLogin(acct)}
                          className={cn(
                            "group flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-all active:scale-[0.97]",
                            acct.color === "sky"
                              ? "border-sky-200/50 bg-sky-50/30 text-sky-700 hover:bg-sky-100/50"
                              : "border-emerald-200/50 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-100/50"
                          )}
                        >
                          <Sparkles className="h-3.5 w-3.5 opacity-60" />
                          {acct.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === "credentials" && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => { setStep("role"); setError(""); }}
                    className="text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="flex-1" />
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    selectedRole === "buyer"
                      ? "bg-sky-100/70 text-sky-700"
                      : "bg-emerald-100/70 text-emerald-700"
                  )}>
                    {selectedRole === "buyer" ? <TrendingUp className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                    {selectedRole === "buyer" ? "Buyer" : "Seller"}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900 tracking-tight text-center">
                  Sign in
                </h2>
                <p className="mt-1 text-[13px] text-slate-500 text-center">
                  Enter your credentials to continue
                </p>

                <form onSubmit={handleLogin} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                        placeholder="Enter username"
                        autoFocus
                        className="w-full rounded-xl border border-slate-200/70 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200/60 focus:border-sky-300/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Enter password"
                        className="w-full rounded-xl border border-slate-200/70 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200/60 focus:border-sky-300/60 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[12px] text-rose-600 font-medium text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98]",
                      selectedRole === "buyer"
                        ? "bg-sky-600 hover:bg-sky-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Sign in
                  </button>
                </form>

                <div className="mt-5">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/60" />
                    </div>
                    <span className="relative bg-white/65 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                      Or use demo
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((acct) => (
                      <button
                        key={acct.username}
                        type="button"
                        onClick={() => handleDemoLogin(acct)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all active:scale-[0.97]",
                          acct.color === "sky"
                            ? "border-sky-200/50 bg-sky-50/30 text-sky-700 hover:bg-sky-100/50"
                            : "border-emerald-200/50 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-100/50"
                        )}
                      >
                        <Sparkles className="h-3.5 w-3.5 opacity-60" />
                        {acct.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Teraverde® Financial LLC. 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
