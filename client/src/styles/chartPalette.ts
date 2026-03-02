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

/** Vivid donut chart palette — high-energy, high-contrast */
export const DONUT_REFERENCE_COLORS = [
  '#22c55e', // vivid green
  '#06b6d4', // neon cyan
  '#10b981', // vivid emerald
  '#f59e0b', // solar amber
  '#ef4444', // vivid red
  '#ec4899', // hot pink
  '#8b5cf6', // bright violet
  '#f97316', // neon orange
] as const;
