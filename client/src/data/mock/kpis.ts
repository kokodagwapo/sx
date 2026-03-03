import { Banknote, LayoutList, Percent, TrendingUp, Clock, Scale } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

export const baseKpis: KpiItem[] = [
  { label: "Total UPB", value: "1,860,760,635", icon: Banknote },
  { label: "Total Loans", value: "7,050", helper: "Meeting criteria", icon: LayoutList },
  { label: "Weighted Avg Coupon", value: "3.50", icon: Percent },
  { label: "Bond Eq Yield", value: "3.17", icon: TrendingUp },
  { label: "Weighted Avg Duration", value: "6.80", icon: Clock },
  { label: "Weighted Price Indication", value: "100.71", icon: Scale },
];
