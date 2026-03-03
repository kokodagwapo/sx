import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";
import {
  buildStep1LoansByGeo,
  buildStep1TractCentroids,
  type LoanGeoRecord,
} from "./step1GeoData";

export type { LoanGeoRecord };

/** All loans for map drilldown - State → County → Census Tract */
export const step1LoansByGeo = buildStep1LoansByGeo();

/** Reference: Geographic Distribution by State — real data from Excel (7,050 loans) */
export const GEO_DISTRIBUTION_REFERENCE: HorizontalBarDatum[] = [
  { name: "CA", value: 1449 },
  { name: "FL", value: 422 },
  { name: "GA", value: 392 },
  { name: "TX", value: 355 },
  { name: "PA", value: 378 },
  { name: "NY", value: 276 },
  { name: "NC", value: 234 },
  { name: "IL", value: 226 },
  { name: "MD", value: 226 },
  { name: "OH", value: 194 },
  { name: "DE", value: 190 },
  { name: "VA", value: 186 },
  { name: "AZ", value: 186 },
  { name: "NJ", value: 250 },
  { name: "WA", value: 224 },
  { name: "CO", value: 213 },
  { name: "UT", value: 207 },
  { name: "SC", value: 157 },
  { name: "MA", value: 122 },
  { name: "TN", value: 122 },
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
