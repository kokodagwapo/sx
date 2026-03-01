import { Banknote, LayoutList, Percent, TrendingUp, Clock, Scale } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

export const baseKpis: KpiItem[] = [
  { label: "Total UPB", value: "1,534,248,974", icon: Banknote },
  { label: "Total Loans", value: "6,293", helper: "Meeting criteria", icon: LayoutList },
  { label: "Weighted Avg Coupon", value: "4.13", icon: Percent },
  { label: "Bond Eq Yield", value: "3.73", icon: TrendingUp },
  { label: "Weighted Avg Duration", value: "7.51", icon: Clock },
  { label: "Weighted Price Indication", value: "103.05", icon: Scale },
];

