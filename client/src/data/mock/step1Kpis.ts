import { Banknote, Clock, TrendingUp, TrendingDown, Scale, Gauge } from "lucide-react";
import type { KpiItem } from "@/components/step/KpiStrip";

export const step1Kpis: KpiItem[] = [
  { label: "UPB", value: "1,534,243,074", icon: Banknote, tooltip: "Total Unpaid Principal Balance (UPB)" },
  { label: "Wtd Avg Duration*", value: "7.51", icon: Clock, tooltip: "Weighted Average Duration*" },
  { label: "Retained BEY*", value: "3.48", icon: TrendingUp, tooltip: "Retained Bond Equivalent Yield*" },
  { label: "Released BEY*", value: "2.72", icon: TrendingDown, tooltip: "Released Bond Equivalent Yield*" },
  { label: "Retained Price**", value: "103.05", icon: Scale, tooltip: "Retained Wght Price Indication**" },
  { label: "Released Price**", value: "103.05", icon: Gauge, tooltip: "Released Wght Price Indication**" },
];
