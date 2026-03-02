/** Bright pastel shared palette — used as default fallback colors */
export const PASTEL_COLORS = [
  '#4ade80', // mint green
  '#38bdf8', // sky blue
  '#a78bfa', // soft violet
  '#fb923c', // peach-orange
  '#f472b6', // bright pink
  '#34d399', // teal-green
  '#facc15', // bright yellow
  '#60a5fa', // cornflower blue
] as const;

/** Value-based bar colors — pastel low→high spectrum */
export const BAR_VALUE_COLORS = [
  '#a78bfa', // violet  — lowest
  '#60a5fa', // cornflower
  '#38bdf8', // sky blue
  '#34d399', // teal-green
  '#4ade80', // mint green
  '#facc15', // yellow
  '#fb923c', // peach-orange
  '#f472b6', // pink  — highest
] as const;

/** Geographic Distribution: high → low (red-orange-blue pastels) */
export const GEO_DISTRIBUTION_COLORS = [
  '#f87171', // soft red     — highest
  '#fb923c', // peach-orange
  '#fbbf24', // amber
  '#facc15', // yellow
  '#4ade80', // mint green
  '#34d399', // teal-green
  '#38bdf8', // sky blue
  '#60a5fa', // cornflower
  '#a78bfa', // violet
  '#c084fc', // soft purple  — lowest
] as const;

/** Bright pastel palette — modern, airy, high-contrast */
export const DONUT_REFERENCE_COLORS = [
  '#4ade80', // bright mint green
  '#38bdf8', // bright sky blue
  '#a78bfa', // soft violet
  '#fb923c', // bright peach-orange
  '#f472b6', // bright pink
  '#34d399', // bright teal-green
  '#facc15', // bright yellow
  '#60a5fa', // cornflower blue
] as const;
