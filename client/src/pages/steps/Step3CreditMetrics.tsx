import { Percent, CreditCard, FileText, Package, Home, Wallet } from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { TourBubble } from "@/components/onboarding/TourBubble";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  step3Dti,
  step3Fico,
  step3Ltv,
  step3Occupancy,
  step3Product,
  step3Purpose,
} from "@/data/mock/step3";
import { Banknote, LayoutList, TrendingUp, Clock, Scale } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

const STEP3_KPIS: KpiItem[] = [
  { label: "Total Unpaid Principal Balance (UPB)", value: "1,534,248,974", icon: Banknote },
  { label: "Total Loans Meeting Criteria", value: "6,293", icon: LayoutList },
  { label: "Weighted Average Coupon", value: "4.13", icon: Percent },
  { label: "Bond Equivalent Yield*", value: "3.73", icon: TrendingUp },
  { label: "Weighted Average Duration*", value: "7.51", icon: Clock },
  { label: "Weighted Price Indication**", value: "103.05", icon: Scale },
];

const FOOTER_METRICS = [
  { label: "Average Loan Size", value: "243,802" },
  { label: "Weighted Average LTV", value: "80.33%" },
  { label: "Weighted Average FICO", value: "720" },
  { label: "Weighted Average DTI", value: "37.74%" },
];

export default function Step3CreditMetrics() {
  return (
    <SprinkleShell stepId="3" kpis={STEP3_KPIS} animateKpis>
      {/* Row 1: LTV, FICO, DTI — horizontal bar charts */}
      <div data-tour="step3-credit-row" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-1"
          icon={Percent}
          title="LTV Distribution"
          subtitle="# of Loans"
        >
          <div className="h-[240px]">
            <HorizontalBarChart data={step3Ltv} valueBasedColors colorScheme="blue" />
          </div>
        </PanelCard>
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
          icon={CreditCard}
          title="FICO Distribution"
          subtitle="# of Loans"
        >
          <div className="h-[240px]">
            <HorizontalBarChart data={step3Fico} valueBasedColors colorScheme="fico" />
          </div>
        </PanelCard>
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-3"
          icon={FileText}
          title="DTI Distribution"
          subtitle="# of Loans"
        >
          <div className="h-[240px]">
            <HorizontalBarChart data={step3Dti} valueBasedColors colorScheme="blue" />
          </div>
        </PanelCard>
      </div>

      {/* Row 2: Product, Occupancy, Purpose — donut charts */}
      <div data-tour="step3-composition-row" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-4"
          icon={Package}
          title="Product Distribution"
        >
          <div className="h-[240px]">
            <DonutChart data={step3Product} animationDuration={900} />
          </div>
        </PanelCard>
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-5"
          icon={Home}
          title="Occupancy Distribution"
        >
          <div className="h-[240px]">
            <DonutChart data={step3Occupancy} animationDuration={900} />
          </div>
        </PanelCard>
        <PanelCard
          className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-6"
          icon={Wallet}
          title="Loan Purpose Distribution"
        >
          <div className="h-[240px]">
            <DonutChart data={step3Purpose} animationDuration={900} />
          </div>
        </PanelCard>
      </div>

      {/* Footer: disclaimers + summary metrics */}
      <footer data-tour="step3-footer" className="mt-8 flex flex-col gap-6 border-t border-slate-200/70 pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FOOTER_METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm opacity-0 animate-fade-in-up [animation-delay:520ms]"
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {m.label}
              </div>
              <div className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 tabular-nums [font-family:var(--font-display)]">
                {m.value}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
          <p>Teraverde Financial LLC. 2026. All rights reserved.</p>
        </div>
      </footer>
      <TourBubble
        stepKey="step3"
        delay={1200}
        steps={[
          {
            title: "Step 3 — Risk Distribution Charts",
            body: "These three horizontal bar charts show how loans are distributed across LTV buckets, FICO score bands, and DTI ranges. Colour intensity reflects concentration — darker bars signal heavier exposure in that band.",
            icon: "chart",
            target: "step3-credit-row",
          },
          {
            title: "Loan Composition Donuts",
            body: "Product type, occupancy status, and loan purpose are shown as donut charts. Click any segment to see the exact count and percentage for that slice.",
            icon: "list",
            target: "step3-composition-row",
          },
          {
            title: "Portfolio Summary Metrics",
            body: "The bottom row shows weighted average LTV, FICO, DTI, and average loan size — useful sanity-check figures for the full portfolio before moving to pricing in Step 4.",
            icon: "lightbulb",
            target: "step3-footer",
            cta: "Got it",
          },
        ]}
        position="bottom-right"
      />
    </SprinkleShell>
  );
}
