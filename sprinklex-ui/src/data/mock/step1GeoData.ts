/**
 * Comprehensive geo sample data: State → County → Census Tract
 * Covers all continental US states with representative counties and tracts.
 * FIPS: state=2 digit, county=5 digit (state+county), tract=11 digit (state+county+tract)
 */

import type { HorizontalBarDatum } from "@/components/charts/HorizontalBarChart";

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

/** Generate tract centroid from county/state (approximate) */
function tractCentroid(stateFips: string, countyFips: string, tractSuffix: string): { lon: number; lat: number } {
  const [baseLon, baseLat] = STATE_CENTERS[stateFips] ?? [-98, 38];
  const hash = (countyFips + tractSuffix).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offsetLon = ((hash % 17) - 8) * 0.15;
  const offsetLat = ((Math.floor(hash / 17) % 13) - 6) * 0.12;
  return { lon: baseLon + offsetLon, lat: baseLat + offsetLat };
}

type GeoSeed = {
  stateFips: string;
  stateName: string;
  stateAbbr: string;
  counties: Array<{
    countyFips: string;
    countyName: string;
    city?: string;
    tracts: Array<{ tractSuffix: string; tractName: string; loanCount: number; upb: number }>;
  }>;
};

const GEO_SEEDS: GeoSeed[] = [
  { stateFips: "06", stateName: "California", stateAbbr: "CA", counties: [
    { countyFips: "06037", countyName: "Los Angeles", city: "Los Angeles", tracts: [
      { tractSuffix: "137001", tractName: "Census Tract 1370.01", loanCount: 42, upb: 12_400_000 },
      { tractSuffix: "137002", tractName: "Census Tract 1370.02", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "141001", tractName: "Census Tract 1410.01", loanCount: 55, upb: 16_100_000 },
      { tractSuffix: "141002", tractName: "Census Tract 1410.02", loanCount: 29, upb: 8_900_000 },
      { tractSuffix: "142001", tractName: "Census Tract 1420.01", loanCount: 33, upb: 9_700_000 },
    ]},
    { countyFips: "06059", countyName: "Orange", city: "Anaheim", tracts: [
      { tractSuffix: "950101", tractName: "Census Tract 9501.01", loanCount: 28, upb: 8_200_000 },
      { tractSuffix: "950102", tractName: "Census Tract 9501.02", loanCount: 41, upb: 12_100_000 },
      { tractSuffix: "950201", tractName: "Census Tract 9502.01", loanCount: 19, upb: 5_600_000 },
    ]},
    { countyFips: "06073", countyName: "San Diego", city: "San Diego", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 36, upb: 10_500_000 },
      { tractSuffix: "101002", tractName: "Census Tract 101.02", loanCount: 22, upb: 6_400_000 },
    ]},
    { countyFips: "06075", countyName: "San Francisco", city: "San Francisco", tracts: [
      { tractSuffix: "601001", tractName: "Census Tract 601.01", loanCount: 31, upb: 9_200_000 },
      { tractSuffix: "602001", tractName: "Census Tract 602.01", loanCount: 27, upb: 8_100_000 },
    ]},
    { countyFips: "06085", countyName: "Santa Clara", city: "San Jose", tracts: [
      { tractSuffix: "501001", tractName: "Census Tract 5010.01", loanCount: 44, upb: 12_900_000 },
      { tractSuffix: "501002", tractName: "Census Tract 5010.02", loanCount: 36, upb: 10_600_000 },
      { tractSuffix: "502001", tractName: "Census Tract 5020.01", loanCount: 29, upb: 8_500_000 },
    ]},
    { countyFips: "06065", countyName: "Riverside", city: "Riverside", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "202001", tractName: "Census Tract 202.01", loanCount: 25, upb: 7_400_000 },
    ]},
  ]},
  { stateFips: "12", stateName: "Florida", stateAbbr: "FL", counties: [
    { countyFips: "12086", countyName: "Miami-Dade", city: "Miami", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 48, upb: 14_200_000 },
      { tractSuffix: "101002", tractName: "Census Tract 101.02", loanCount: 31, upb: 9_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 27, upb: 7_900_000 },
    ]},
    { countyFips: "12011", countyName: "Broward", city: "Fort Lauderdale", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 39, upb: 11_500_000 },
      { tractSuffix: "101002", tractName: "Census Tract 101.02", loanCount: 24, upb: 7_100_000 },
    ]},
    { countyFips: "12099", countyName: "Palm Beach", city: "West Palm Beach", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 35, upb: 10_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 18, upb: 5_400_000 },
    ]},
  ]},
  { stateFips: "13", stateName: "Georgia", stateAbbr: "GA", counties: [
    { countyFips: "13121", countyName: "Fulton", city: "Atlanta", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 52, upb: 15_300_000 },
      { tractSuffix: "101002", tractName: "Census Tract 101.02", loanCount: 44, upb: 12_900_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 18, upb: 5_300_000 },
    ]},
    { countyFips: "13089", countyName: "DeKalb", city: "Decatur", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 29, upb: 8_500_000 },
      { tractSuffix: "202001", tractName: "Census Tract 202.01", loanCount: 22, upb: 6_400_000 },
    ]},
  ]},
  { stateFips: "36", stateName: "New York", stateAbbr: "NY", counties: [
    { countyFips: "36047", countyName: "Kings", city: "Brooklyn", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 61, upb: 18_000_000 },
      { tractSuffix: "101002", tractName: "Census Tract 101.02", loanCount: 35, upb: 10_300_000 },
    ]},
    { countyFips: "36061", countyName: "New York", city: "Manhattan", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 45, upb: 13_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 38, upb: 11_100_000 },
    ]},
    { countyFips: "36081", countyName: "Queens", city: "Queens", tracts: [
      { tractSuffix: "301001", tractName: "Census Tract 301.01", loanCount: 41, upb: 12_000_000 },
      { tractSuffix: "302001", tractName: "Census Tract 302.01", loanCount: 33, upb: 9_700_000 },
    ]},
  ]},
  { stateFips: "42", stateName: "Pennsylvania", stateAbbr: "PA", counties: [
    { countyFips: "42101", countyName: "Philadelphia", city: "Philadelphia", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 55, upb: 16_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 42, upb: 12_300_000 },
    ]},
    { countyFips: "42003", countyName: "Allegheny", city: "Pittsburgh", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 38, upb: 11_100_000 },
      { tractSuffix: "202001", tractName: "Census Tract 202.01", loanCount: 29, upb: 8_500_000 },
    ]},
  ]},
  { stateFips: "48", stateName: "Texas", stateAbbr: "TX", counties: [
    { countyFips: "48201", countyName: "Harris", city: "Houston", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 52, upb: 15_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 44, upb: 12_900_000 },
    ]},
    { countyFips: "48113", countyName: "Dallas", city: "Dallas", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 48, upb: 14_100_000 },
      { tractSuffix: "202001", tractName: "Census Tract 202.01", loanCount: 36, upb: 10_600_000 },
    ]},
    { countyFips: "48453", countyName: "Tarrant", city: "Fort Worth", tracts: [
      { tractSuffix: "301001", tractName: "Census Tract 301.01", loanCount: 31, upb: 9_100_000 },
      { tractSuffix: "302001", tractName: "Census Tract 302.01", loanCount: 27, upb: 7_900_000 },
    ]},
    { countyFips: "48029", countyName: "Bexar", city: "San Antonio", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 41, upb: 12_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 33, upb: 9_700_000 },
    ]},
  ]},
  { stateFips: "51", stateName: "Virginia", stateAbbr: "VA", counties: [
    { countyFips: "51013", countyName: "Arlington", city: "Arlington", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 35, upb: 10_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
    { countyFips: "51610", countyName: "Fairfax City", city: "Fairfax", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 42, upb: 12_300_000 },
    ]},
  ]},
  { stateFips: "39", stateName: "Ohio", stateAbbr: "OH", counties: [
    { countyFips: "39035", countyName: "Cuyahoga", city: "Cleveland", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 29, upb: 8_500_000 },
    ]},
    { countyFips: "39049", countyName: "Franklin", city: "Columbus", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 45, upb: 13_200_000 },
    ]},
  ]},
  { stateFips: "37", stateName: "North Carolina", stateAbbr: "NC", counties: [
    { countyFips: "37081", countyName: "Mecklenburg", city: "Charlotte", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 48, upb: 14_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 36, upb: 10_600_000 },
    ]},
    { countyFips: "37183", countyName: "Wake", city: "Raleigh", tracts: [
      { tractSuffix: "201001", tractName: "Census Tract 201.01", loanCount: 41, upb: 12_000_000 },
    ]},
  ]},
  { stateFips: "34", stateName: "New Jersey", stateAbbr: "NJ", counties: [
    { countyFips: "34003", countyName: "Bergen", city: "Hackensack", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 39, upb: 11_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 31, upb: 9_100_000 },
    ]},
  ]},
  { stateFips: "17", stateName: "Illinois", stateAbbr: "IL", counties: [
    { countyFips: "17031", countyName: "Cook", city: "Chicago", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 58, upb: 17_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 44, upb: 12_900_000 },
    ]},
  ]},
  { stateFips: "25", stateName: "Massachusetts", stateAbbr: "MA", counties: [
    { countyFips: "25025", countyName: "Suffolk", city: "Boston", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 52, upb: 15_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 38, upb: 11_200_000 },
    ]},
  ]},
  { stateFips: "26", stateName: "Michigan", stateAbbr: "MI", counties: [
    { countyFips: "26163", countyName: "Wayne", city: "Detroit", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 42, upb: 12_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 35, upb: 10_300_000 },
    ]},
  ]},
  { stateFips: "04", stateName: "Arizona", stateAbbr: "AZ", counties: [
    { countyFips: "04013", countyName: "Maricopa", city: "Phoenix", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 48, upb: 14_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 36, upb: 10_600_000 },
    ]},
  ]},
  { stateFips: "53", stateName: "Washington", stateAbbr: "WA", counties: [
    { countyFips: "53033", countyName: "King", city: "Seattle", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 45, upb: 13_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 38, upb: 11_200_000 },
    ]},
  ]},
  { stateFips: "41", stateName: "Oregon", stateAbbr: "OR", counties: [
    { countyFips: "41051", countyName: "Multnomah", city: "Portland", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 39, upb: 11_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 31, upb: 9_100_000 },
    ]},
  ]},
  { stateFips: "18", stateName: "Indiana", stateAbbr: "IN", counties: [
    { countyFips: "18097", countyName: "Marion", city: "Indianapolis", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 44, upb: 12_900_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 32, upb: 9_400_000 },
    ]},
  ]},
  { stateFips: "47", stateName: "Tennessee", stateAbbr: "TN", counties: [
    { countyFips: "47037", countyName: "Davidson", city: "Nashville", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 41, upb: 12_000_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 35, upb: 10_300_000 },
    ]},
  ]},
  { stateFips: "45", stateName: "South Carolina", stateAbbr: "SC", counties: [
    { countyFips: "45019", countyName: "Charleston", city: "Charleston", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 36, upb: 10_600_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
  ]},
  { stateFips: "24", stateName: "Maryland", stateAbbr: "MD", counties: [
    { countyFips: "24003", countyName: "Anne Arundel", city: "Annapolis", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 33, upb: 9_700_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 27, upb: 7_900_000 },
    ]},
  ]},
  { stateFips: "10", stateName: "Delaware", stateAbbr: "DE", counties: [
    { countyFips: "10003", countyName: "New Castle", city: "Wilmington", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 29, upb: 8_500_000 },
    ]},
  ]},
  { stateFips: "29", stateName: "Missouri", stateAbbr: "MO", counties: [
    { countyFips: "29189", countyName: "St. Louis City", city: "St. Louis", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 35, upb: 10_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
  ]},
  { stateFips: "08", stateName: "Colorado", stateAbbr: "CO", counties: [
    { countyFips: "08031", countyName: "Denver", city: "Denver", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 42, upb: 12_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 34, upb: 10_000_000 },
    ]},
  ]},
  { stateFips: "55", stateName: "Wisconsin", stateAbbr: "WI", counties: [
    { countyFips: "55079", countyName: "Milwaukee", city: "Milwaukee", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 30, upb: 8_800_000 },
    ]},
  ]},
  { stateFips: "27", stateName: "Minnesota", stateAbbr: "MN", counties: [
    { countyFips: "27053", countyName: "Hennepin", city: "Minneapolis", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 44, upb: 12_900_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 36, upb: 10_600_000 },
    ]},
  ]},
  { stateFips: "01", stateName: "Alabama", stateAbbr: "AL", counties: [
    { countyFips: "01073", countyName: "Jefferson", city: "Birmingham", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 32, upb: 9_400_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 26, upb: 7_600_000 },
    ]},
  ]},
  { stateFips: "22", stateName: "Louisiana", stateAbbr: "LA", counties: [
    { countyFips: "22071", countyName: "Orleans", city: "New Orleans", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 35, upb: 10_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
  ]},
  { stateFips: "21", stateName: "Kentucky", stateAbbr: "KY", counties: [
    { countyFips: "21111", countyName: "Jefferson", city: "Louisville", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 33, upb: 9_700_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 27, upb: 7_900_000 },
    ]},
  ]},
  { stateFips: "40", stateName: "Oklahoma", stateAbbr: "OK", counties: [
    { countyFips: "40109", countyName: "Oklahoma", city: "Oklahoma City", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 36, upb: 10_600_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 29, upb: 8_500_000 },
    ]},
  ]},
  { stateFips: "49", stateName: "Utah", stateAbbr: "UT", counties: [
    { countyFips: "49049", countyName: "Salt Lake", city: "Salt Lake City", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 39, upb: 11_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 31, upb: 9_100_000 },
    ]},
  ]},
  { stateFips: "09", stateName: "Connecticut", stateAbbr: "CT", counties: [
    { countyFips: "09003", countyName: "Hartford", city: "Hartford", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 34, upb: 10_000_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
  ]},
  { stateFips: "44", stateName: "Rhode Island", stateAbbr: "RI", counties: [
    { countyFips: "44007", countyName: "Providence", city: "Providence", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 30, upb: 8_800_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 24, upb: 7_100_000 },
    ]},
  ]},
  { stateFips: "23", stateName: "Maine", stateAbbr: "ME", counties: [
    { countyFips: "23005", countyName: "Cumberland", city: "Portland", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 26, upb: 7_600_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 21, upb: 6_200_000 },
    ]},
  ]},
  { stateFips: "33", stateName: "New Hampshire", stateAbbr: "NH", counties: [
    { countyFips: "33011", countyName: "Hillsborough", city: "Manchester", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 28, upb: 8_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 22, upb: 6_500_000 },
    ]},
  ]},
  { stateFips: "50", stateName: "Vermont", stateAbbr: "VT", counties: [
    { countyFips: "50007", countyName: "Chittenden", city: "Burlington", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 22, upb: 6_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 18, upb: 5_300_000 },
    ]},
  ]},
  { stateFips: "31", stateName: "Nebraska", stateAbbr: "NE", counties: [
    { countyFips: "31055", countyName: "Douglas", city: "Omaha", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 32, upb: 9_400_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 26, upb: 7_600_000 },
    ]},
  ]},
  { stateFips: "20", stateName: "Kansas", stateAbbr: "KS", counties: [
    { countyFips: "20091", countyName: "Johnson", city: "Overland Park", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 35, upb: 10_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 28, upb: 8_200_000 },
    ]},
  ]},
  { stateFips: "28", stateName: "Mississippi", stateAbbr: "MS", counties: [
    { countyFips: "28049", countyName: "Hinds", city: "Jackson", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 29, upb: 8_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 23, upb: 6_800_000 },
    ]},
  ]},
  { stateFips: "54", stateName: "West Virginia", stateAbbr: "WV", counties: [
    { countyFips: "54039", countyName: "Kanawha", city: "Charleston", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 24, upb: 7_100_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 19, upb: 5_600_000 },
    ]},
  ]},
  { stateFips: "16", stateName: "Idaho", stateAbbr: "ID", counties: [
    { countyFips: "16001", countyName: "Ada", city: "Boise", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 28, upb: 8_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 22, upb: 6_500_000 },
    ]},
  ]},
  { stateFips: "32", stateName: "Nevada", stateAbbr: "NV", counties: [
    { countyFips: "32003", countyName: "Clark", city: "Las Vegas", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 45, upb: 13_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 38, upb: 11_200_000 },
    ]},
  ]},
  { stateFips: "56", stateName: "Wyoming", stateAbbr: "WY", counties: [
    { countyFips: "56021", countyName: "Laramie", city: "Cheyenne", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 18, upb: 5_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 14, upb: 4_100_000 },
    ]},
  ]},
  { stateFips: "02", stateName: "Alaska", stateAbbr: "AK", counties: [
    { countyFips: "02020", countyName: "Anchorage", city: "Anchorage", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 12, upb: 3_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 9, upb: 2_700_000 },
    ]},
  ]},
  { stateFips: "15", stateName: "Hawaii", stateAbbr: "HI", counties: [
    { countyFips: "15003", countyName: "Honolulu", city: "Honolulu", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 28, upb: 8_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 22, upb: 6_500_000 },
    ]},
  ]},
  { stateFips: "05", stateName: "Arkansas", stateAbbr: "AR", counties: [
    { countyFips: "05119", countyName: "Pulaski", city: "Little Rock", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 26, upb: 7_600_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 21, upb: 6_200_000 },
    ]},
  ]},
  { stateFips: "11", stateName: "District of Columbia", stateAbbr: "DC", counties: [
    { countyFips: "11001", countyName: "District of Columbia", city: "Washington", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 38, upb: 11_200_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 31, upb: 9_100_000 },
    ]},
  ]},
  { stateFips: "19", stateName: "Iowa", stateAbbr: "IA", counties: [
    { countyFips: "19153", countyName: "Polk", city: "Des Moines", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 30, upb: 8_800_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 24, upb: 7_100_000 },
    ]},
  ]},
  { stateFips: "30", stateName: "Montana", stateAbbr: "MT", counties: [
    { countyFips: "30049", countyName: "Missoula", city: "Missoula", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 18, upb: 5_300_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 14, upb: 4_100_000 },
    ]},
  ]},
  { stateFips: "35", stateName: "New Mexico", stateAbbr: "NM", counties: [
    { countyFips: "35001", countyName: "Bernalillo", city: "Albuquerque", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 32, upb: 9_400_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 26, upb: 7_600_000 },
    ]},
  ]},
  { stateFips: "38", stateName: "North Dakota", stateAbbr: "ND", counties: [
    { countyFips: "38017", countyName: "Cass", city: "Fargo", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 20, upb: 5_900_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 16, upb: 4_700_000 },
    ]},
  ]},
  { stateFips: "46", stateName: "South Dakota", stateAbbr: "SD", counties: [
    { countyFips: "46099", countyName: "Minnehaha", city: "Sioux Falls", tracts: [
      { tractSuffix: "101001", tractName: "Census Tract 101.01", loanCount: 22, upb: 6_500_000 },
      { tractSuffix: "102001", tractName: "Census Tract 102.01", loanCount: 18, upb: 5_300_000 },
    ]},
  ]},
];

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return String(idCounter);
}

export function buildStep1LoansByGeo(): LoanGeoRecord[] {
  const records: LoanGeoRecord[] = [];
  for (const state of GEO_SEEDS) {
    for (const county of state.counties) {
      for (const tract of county.tracts) {
        const tractFips = state.stateFips + county.countyFips.slice(2) + tract.tractSuffix;
        records.push({
          id: nextId(),
          stateFips: state.stateFips,
          stateName: state.stateName,
          countyFips: county.countyFips,
          countyName: county.countyName,
          city: county.city,
          tractFips,
          tractName: tract.tractName,
          loanCount: tract.loanCount,
          upb: tract.upb,
        });
      }
    }
  }
  idCounter = 0;
  return records;
}

export function buildStep1TractCentroids(loans: LoanGeoRecord[]): Array<{ tractFips: string; lon: number; lat: number }> {
  const seen = new Set<string>();
  const centroids: Array<{ tractFips: string; lon: number; lat: number }> = [];
  for (const l of loans) {
    if (seen.has(l.tractFips)) continue;
    seen.add(l.tractFips);
    const { lon, lat } = tractCentroid(l.stateFips, l.countyFips, l.tractFips.slice(5));
    centroids.push({ tractFips: l.tractFips, lon, lat });
  }
  return centroids;
}

export function buildStep1StateBars(loans: LoanGeoRecord[]): HorizontalBarDatum[] {
  const byState = new Map<string, number>();
  const abbrMap = new Map(GEO_SEEDS.map((s) => [s.stateFips, s.stateAbbr]));
  for (const l of loans) {
    byState.set(l.stateFips, (byState.get(l.stateFips) ?? 0) + l.loanCount);
  }
  return Array.from(byState.entries())
    .map(([fips, value]) => ({ name: abbrMap.get(fips) ?? fips, value }))
    .sort((a, b) => b.value - a.value);
}
