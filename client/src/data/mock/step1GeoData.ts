/**
 * Real geo data: State → County (one entry per county)
 * Generated from realLoans.json — 7,050 actual loans across 49 states / 889 counties.
 * FIPS: state=2 digit, county=5 digit (state+county)
 */

import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";
import realGeoDataRaw from "@/data/real/realGeoData.json";

export type LoanGeoRecord = {
  id: string;
  stateFips: string;
  stateName: string;
  countyFips: string;
  countyName: string;
  city?: string;
  tractFips: string;
  tractName: string;
  loanCount: number;
  upb: number;
};

/** State FIPS → approximate center [lon, lat] for map zoom */
export const STATE_CENTERS: Record<string, [number, number]> = {
  "01": [-86.9, 32.3], "02": [-153.5, 64.8], "04": [-111.6, 34.4], "05": [-92.4, 34.9], "06": [-119.4, 37.2],
  "08": [-105.3, 39.1], "09": [-72.8, 41.6], "10": [-75.5, 38.9], "11": [-77.0, 38.9],
  "12": [-81.5, 27.5], "13": [-83.6, 32.6], "15": [-155.6, 19.7], "16": [-114.2, 43.6], "17": [-89.6, 40.0],
  "18": [-86.1, 40.3], "19": [-93.6, 42.0], "20": [-98.4, 38.5], "21": [-84.3, 37.7],
  "22": [-91.9, 31.0], "23": [-69.4, 45.4], "24": [-76.6, 38.9], "25": [-71.4, 42.4],
  "26": [-84.5, 43.6], "27": [-94.7, 46.4], "28": [-89.6, 32.7], "29": [-91.4, 37.9],
  "30": [-110.4, 46.9], "31": [-99.9, 41.1], "32": [-116.4, 38.3], "33": [-71.5, 43.2],
  "34": [-74.5, 40.2], "35": [-105.9, 34.5], "36": [-75.5, 43.0], "37": [-79.0, 35.5],
  "38": [-99.5, 47.5], "39": [-82.9, 40.4], "40": [-97.5, 35.5], "41": [-120.6, 43.8],
  "42": [-77.2, 41.2], "44": [-71.5, 41.6], "45": [-81.2, 34.0], "46": [-99.4, 44.4],
  "47": [-86.6, 35.8], "48": [-99.5, 31.5], "49": [-111.6, 39.3], "50": [-72.6, 44.1],
  "51": [-78.7, 37.4], "53": [-120.7, 47.4], "54": [-80.5, 38.6], "55": [-89.6, 44.6],
  "56": [-107.3, 43.0],
};

/** State FIPS → 2-letter abbreviation */
const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

function tractCentroid(stateFips: string, countyFips: string): { lon: number; lat: number } {
  const [baseLon, baseLat] = STATE_CENTERS[stateFips] ?? [-98, 38];
  const hash = countyFips.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offsetLon = ((hash % 17) - 8) * 0.2;
  const offsetLat = ((Math.floor(hash / 17) % 13) - 6) * 0.15;
  return { lon: baseLon + offsetLon, lat: baseLat + offsetLat };
}

/** All loans for map drilldown — real data: one entry per county */
export function buildStep1LoansByGeo(): LoanGeoRecord[] {
  return realGeoDataRaw as LoanGeoRecord[];
}

export function buildStep1TractCentroids(loans: LoanGeoRecord[]): Array<{ tractFips: string; lon: number; lat: number }> {
  const seen = new Set<string>();
  const centroids: Array<{ tractFips: string; lon: number; lat: number }> = [];
  for (const l of loans) {
    if (seen.has(l.tractFips)) continue;
    seen.add(l.tractFips);
    const { lon, lat } = tractCentroid(l.stateFips, l.countyFips);
    centroids.push({ tractFips: l.tractFips, lon, lat });
  }
  return centroids;
}

export function buildStep1StateBars(loans: LoanGeoRecord[]): HorizontalBarDatum[] {
  const byState = new Map<string, number>();
  for (const l of loans) {
    byState.set(l.stateFips, (byState.get(l.stateFips) ?? 0) + l.loanCount);
  }
  return Array.from(byState.entries())
    .map(([fips, value]) => ({ name: FIPS_TO_ABBR[fips] ?? fips, value }))
    .sort((a, b) => b.value - a.value);
}
