import { Banknote, Clock, TrendingUp, TrendingDown, Scale, Gauge } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

export const step1Kpis: KpiItem[] = [
  { label: "UPB", value: "1,861,333,635", icon: Banknote, tooltip: "Total Unpaid Principal Balance (UPB)" },
  { label: "Wtd Avg Duration*", value: "6.80", icon: Clock, tooltip: "Weighted Average Duration*" },
  { label: "Retained BEY*", value: "3.17", icon: TrendingUp, tooltip: "Retained Bond Equivalent Yield*" },
  { label: "Released BEY*", value: "2.44", icon: TrendingDown, tooltip: "Released Bond Equivalent Yield*" },
  { label: "Retained Price**", value: "100.71", icon: Scale, tooltip: "Retained Wght Price Indication**" },
  { label: "Released Price**", value: "100.71", icon: Gauge, tooltip: "Released Wght Price Indication**" },
];
