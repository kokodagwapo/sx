import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";
import {
  buildStep1LoansByGeo,
  buildStep1TractCentroids,
  type LoanGeoRecord,
} from "./step1GeoData";

export type { LoanGeoRecord };

/** All loans for map drilldown - State → County → Census Tract */
export const step1LoansByGeo = buildStep1LoansByGeo();

/** Reference: Geographic Distribution by State — exact data from design */
export const GEO_DISTRIBUTION_REFERENCE: HorizontalBarDatum[] = [
  { name: "CA", value: 680 },
  { name: "FL", value: 638 },
  { name: "GA", value: 605 },
  { name: "NY", value: 449 },
  { name: "PA", value: 370 },
  { name: "NC", value: 285 },
  { name: "OH", value: 262 },
  { name: "TX", value: 215 },
  { name: "DE", value: 214 },
  { name: "SC", value: 209 },
  { name: "MD", value: 187 },
  { name: "TN", value: 176 },
  { name: "MA", value: 174 },
  { name: "NJ", value: 170 },
  { name: "VA", value: 168 },
  { name: "WA", value: 152 },
  { name: "OR", value: 131 },
  { name: "AZ", value: 127 },
  { name: "MI", value: 120 },
  { name: "IN", value: 118 },
];

/** State-level bar chart data — use reference when at state level, else aggregated from loans */
export const step1StateBars: HorizontalBarDatum[] = GEO_DISTRIBUTION_REFERENCE;

/** Tract centroids for point map at tract level */
export const step1TractCentroids = buildStep1TractCentroids(step1LoansByGeo);

/** Legacy map data (for compatibility) */
export const step1MapData = step1StateBars.map((b) => ({
  stateName: b.name,
  value: b.value,
}));
