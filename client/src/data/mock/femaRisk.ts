/** FEMA & Environmental Risk data by state — for Geography overlay */

export type RiskLevel = "High" | "Moderate" | "Low";

export type StateRisk = {
  state: string;
  floodZone: RiskLevel;
  floodDisasters: number;
  wildfireRisk: RiskLevel;
  wildfireDisasters: number;
  hurricaneRisk: RiskLevel;
  notes?: string;
};

/**
 * Representative real-world FEMA risk data for the top loan-volume states.
 * Flood data based on FEMA NFHL SFHA designations & DR declarations.
 * Wildfire data based on USFS National Forest Service risk index.
 * Hurricane risk based on NOAA coastal exposure analysis.
 */
export const STATE_RISK: Record<string, StateRisk> = {
  CA: { state: "CA", floodZone: "Moderate", floodDisasters: 12, wildfireRisk: "High", wildfireDisasters: 28, hurricaneRisk: "Low", notes: "Highest wildfire risk in US; significant flood risk in Central Valley and coastal areas." },
  FL: { state: "FL", floodZone: "High", floodDisasters: 24, wildfireRisk: "Moderate", wildfireDisasters: 8, hurricaneRisk: "High", notes: "Major hurricane and flood exposure; most NFIP policies of any state." },
  GA: { state: "GA", floodZone: "Moderate", floodDisasters: 14, wildfireRisk: "Low", wildfireDisasters: 3, hurricaneRisk: "Moderate", notes: "Coastal flooding risk; moderate hurricane threat on coast." },
  NY: { state: "NY", floodZone: "Moderate", floodDisasters: 18, wildfireRisk: "Low", wildfireDisasters: 1, hurricaneRisk: "Moderate", notes: "Post-Sandy flood designations elevated; coastal storm surge risk." },
  PA: { state: "PA", floodZone: "Moderate", floodDisasters: 11, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Low", notes: "Inland flooding along rivers; low wildfire risk." },
  NC: { state: "NC", floodZone: "High", floodDisasters: 22, wildfireRisk: "Low", wildfireDisasters: 2, hurricaneRisk: "High", notes: "Significant hurricane and tropical storm flood history (Floyd, Matthew, Florence, Dorian)." },
  OH: { state: "OH", floodZone: "Low", floodDisasters: 8, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Low" },
  TX: { state: "TX", floodZone: "High", floodDisasters: 31, wildfireRisk: "High", wildfireDisasters: 19, hurricaneRisk: "High", notes: "Harvey (2017) caused $125B+ damage; extensive wildfire risk in west TX; major hurricane exposure." },
  DE: { state: "DE", floodZone: "Moderate", floodDisasters: 9, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Moderate", notes: "Coastal flooding; low elevation increases storm surge risk." },
  SC: { state: "SC", floodZone: "High", floodDisasters: 17, wildfireRisk: "Low", wildfireDisasters: 1, hurricaneRisk: "High", notes: "Major hurricane path; coastal flooding significant." },
  MD: { state: "MD", floodZone: "Moderate", floodDisasters: 13, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Moderate", notes: "Chesapeake Bay flooding; moderate coastal storm risk." },
  TN: { state: "TN", floodZone: "Moderate", floodDisasters: 12, wildfireRisk: "Low", wildfireDisasters: 2, hurricaneRisk: "Low", notes: "Inland flooding; 2021 Humphreys County flood was historic." },
  MA: { state: "MA", floodZone: "Moderate", floodDisasters: 10, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Moderate", notes: "Nor'easter storm surge; coastal flood risk on Cape Cod." },
  NJ: { state: "NJ", floodZone: "High", floodDisasters: 20, wildfireRisk: "Low", wildfireDisasters: 1, hurricaneRisk: "Moderate", notes: "Sandy severely impacted; many Zone AE designations along coast." },
  VA: { state: "VA", floodZone: "Moderate", floodDisasters: 14, wildfireRisk: "Low", wildfireDisasters: 1, hurricaneRisk: "Moderate", notes: "Hampton Roads is one of the fastest sea-level rising areas in the US." },
  WA: { state: "WA", floodZone: "Moderate", floodDisasters: 9, wildfireRisk: "High", wildfireDisasters: 16, hurricaneRisk: "Low", notes: "Eastern WA extreme wildfire risk; western WA coastal flooding." },
  OR: { state: "OR", floodZone: "Moderate", floodDisasters: 8, wildfireRisk: "High", wildfireDisasters: 14, hurricaneRisk: "Low", notes: "2020 Labor Day fires burned 1M+ acres; coast prone to tsunami risk." },
  AZ: { state: "AZ", floodZone: "Low", floodDisasters: 6, wildfireRisk: "High", wildfireDisasters: 18, hurricaneRisk: "Low", notes: "Flash flooding in monsoon season; extreme wildfire risk statewide." },
  MI: { state: "MI", floodZone: "Low", floodDisasters: 7, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Low" },
  IN: { state: "IN", floodZone: "Moderate", floodDisasters: 10, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Low" },
  CO: { state: "CO", floodZone: "Low", floodDisasters: 7, wildfireRisk: "High", wildfireDisasters: 20, hurricaneRisk: "Low", notes: "Marshall Fire (2021); extreme Front Range wildfire risk." },
  IL: { state: "IL", floodZone: "Moderate", floodDisasters: 9, wildfireRisk: "Low", wildfireDisasters: 0, hurricaneRisk: "Low" },
  UT: { state: "UT", floodZone: "Low", floodDisasters: 5, wildfireRisk: "High", wildfireDisasters: 12, hurricaneRisk: "Low", notes: "Significant wildfire risk; growing drought conditions." },
};

export const DEFAULT_RISK: StateRisk = {
  state: "—",
  floodZone: "Low",
  floodDisasters: 2,
  wildfireRisk: "Low",
  wildfireDisasters: 1,
  hurricaneRisk: "Low",
};

export function getRiskForState(stateAbbr: string): StateRisk {
  return STATE_RISK[stateAbbr] ?? DEFAULT_RISK;
}

export const RISK_COLORS: Record<RiskLevel, { fill: string; badge: string; text: string }> = {
  High:     { fill: "#1e3a8a", badge: "bg-blue-100 text-blue-900 border-blue-300",    text: "text-blue-900" },
  Moderate: { fill: "#0891b2", badge: "bg-cyan-100 text-cyan-800 border-cyan-300",    text: "text-cyan-700" },
  Low:      { fill: "#bae6fd", badge: "bg-sky-50  text-sky-700  border-sky-200",      text: "text-sky-600"  },
};

export const WILDFIRE_COLORS: Record<RiskLevel, { fill: string }> = {
  High: { fill: "#f97316" },
  Moderate: { fill: "#facc15" },
  Low: { fill: "#4ade80" },
};
