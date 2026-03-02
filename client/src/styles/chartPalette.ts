/** Chart palette — blue/green theme with pastels */
export const PASTEL_COLORS = [
  '#4285F4', // primary blue
  '#34A853', // accent green
  '#7dd3fc', // sky
  '#86efac', // mint
  '#c4b5fd', // lavender
  '#fdba74', // peach
  '#fcd34d', // amber
  '#f9a8d4', // rose
] as const;

/** Reference image: value-based bar colors (low→high: light blue, medium blue, orange, dark red) */
export const BAR_VALUE_COLORS = [
  '#7dd3fc', // light blue - lowest
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#fdba74', // orange - medium
  '#f97316',
  '#dc2626', // dark red - highest
  '#991b1b',
] as const;

/** Geographic Distribution: high (red) → low (blue) — matches reference choropleth style */
export const GEO_DISTRIBUTION_COLORS = [
  '#991b1b', // darkest red - highest
  '#dc2626',
  '#ef4444',
  '#f97316', // orange
  '#fdba74', // light orange
  '#93c5fd', // light blue
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1e40af', // darkest blue - lowest
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
