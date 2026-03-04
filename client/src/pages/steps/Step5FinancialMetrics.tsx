import { Scale, BarChart3, Calculator, Banknote, LayoutList, Percent, TrendingUp, Clock } from "lucide-react";
import { PanelCard } from "@/components/cards/PanelCard";
import { SprinkleShell } from "@/layouts/SprinkleShell";
import { TourBubble } from "@/components/onboarding/TourBubble";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { step5ByProduct, step5ByRate } from "@/data/mock/step5";
import type { KpiItem } from "@/components/step/KpiStrip";

const STEP5_KPIS: KpiItem[] = [
  { label: "Total Unpaid Principal Balance (UPB)", value: "1,861,333,635", icon: Banknote },
  { label: "Total Loans Meeting Criteria", value: "7,050", icon: LayoutList },
  { label: "Weighted Average Coupon", value: "3.50", icon: Percent },
  { label: "Bond Equivalent Yield*", value: "3.17", icon: TrendingUp },
  { label: "Weighted Average Duration*", value: "6.80", icon: Clock },
  { label: "Weighted Price Indication**", value: "100.71", icon: Scale },
];

const BALANCE_SHEET = [
  { label: "Total Unpaid Principal Balance (UPB)", value: "1,861,333,635" },
  { label: "Premium (Discount)", value: "13,263,000" },
  { label: "Total Purchase Price", value: "1,874,023,635" },
  { label: "Weighted Avg Maturity", value: "28" },
];

const INCOME_STATEMENT = [
  { label: "Estimated First Year Income (prior to amort)", value: "65,127,000" },
  { label: "Estimated First Year Premium (Discount) Amort.", value: "1,990,000" },
  { label: "Estimated First Year Income (after amort)", value: "63,137,000" },
  { label: "Current Portfolio Yield (BPS)", value: "3.50" },
  { label: "Estimated First Year Amort. (BPS)", value: "0.11" },
];

function BigNumber({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-slate-50">
      <div className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-500 break-words">{label}</div>
      <div className="mt-1 sm:mt-1.5 text-base sm:text-xl font-bold tracking-tight text-slate-900 tabular-nums [font-family:var(--font-display)] break-words">
        {value}
      </div>
    </div>
  );
}

export default function Step5FinancialMetrics() {
  return (
    <SprinkleShell stepId="5" kpis={STEP5_KPIS} animateKpis>
      <div data-tour="financial-kpis" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Balance Sheet Considerations */}
        <PanelCard
          className="col-span-1 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1 lg:col-span-4"
          icon={Scale}
          title="Balance Sheet"
          subtitle="Considerations"
        >
          <div className="space-y-4">
            {BALANCE_SHEET.map((item) => (
              <BigNumber key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </PanelCard>

        {/* Middle: Bar charts */}
        <div data-tour="financial-charts" className="col-span-1 space-y-4 lg:col-span-4">
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-2"
            icon={BarChart3}
            title="Selected Loans by Product Type"
            subtitle="# of Loans"
          >
            <div className="h-[240px]">
              <VerticalBarChart data={step5ByProduct} valueBasedColors showLabels />
            </div>
          </PanelCard>
          <PanelCard
            className="opacity-0 animate-fade-in-up animate-fade-in-up-delay-3"
            icon={BarChart3}
            title="Selected Loans by Interest Rate"
            subtitle="# of Loans"
          >
            <div className="h-[240px]">
              <VerticalBarChart data={step5ByRate} valueBasedColors showLabels />
            </div>
          </PanelCard>
        </div>

        {/* Right: Income Statement Considerations */}
        <PanelCard
          className="col-span-1 opacity-0 animate-fade-in-up animate-fade-in-up-delay-1 lg:col-span-4"
          icon={Calculator}
          title="Income Statement Considerations"
        >
          <div className="space-y-4">
            {INCOME_STATEMENT.map((item) => (
              <BigNumber key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </PanelCard>
      </div>

      <footer data-tour="financial-footer" className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
        <p>* Selected Loans &nbsp; ** Teraverde Indicative Pricing</p>
        <p className="mt-1">Teraverde Financial LLC. 2026. All rights reserved.</p>
      </footer>
    </SprinkleShell>
  );
}
