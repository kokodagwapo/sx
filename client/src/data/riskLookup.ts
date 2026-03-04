export type RiskLevel = "Very High" | "High" | "Medium" | "Low" | "Very Low";

export interface CountyRisk {
  floodRisk: RiskLevel;
  fireRisk: RiskLevel;
  floodScore: number;
  fireScore: number;
}

function scoreToLevel(s: number): RiskLevel {
  if (s >= 80) return "Very High";
  if (s >= 60) return "High";
  if (s >= 40) return "Medium";
  if (s >= 20) return "Low";
  return "Very Low";
}

const STATE_FLOOD: Record<string, number> = {
  LA: 88, FL: 78, MS: 72, WV: 72, TX: 65, NC: 65, SC: 62, AL: 62,
  VA: 58, NJ: 60, MD: 55, GA: 50, TN: 52, OH: 50, PA: 48, IN: 48,
  AR: 55, MO: 52, MN: 45, KY: 50, NY: 50, MA: 48, CT: 48, RI: 50,
  WI: 45, IA: 45, OK: 50, MI: 45, IL: 45, NE: 42, KS: 42, SD: 42,
  ND: 45, DE: 50, NH: 38, VT: 42, ME: 40, WY: 30, MT: 32, ID: 30,
  CO: 30, UT: 28, AZ: 25, NM: 28, NV: 22, CA: 38, OR: 35, WA: 38,
  DC: 45, HI: 48,
};

const STATE_FIRE: Record<string, number> = {
  CA: 85, OR: 72, WA: 68, CO: 70, AZ: 65, NM: 65, MT: 65, ID: 60,
  NV: 58, UT: 60, WY: 55, SD: 48, TX: 50, OK: 48, GA: 45, FL: 48,
  SC: 40, NC: 40, AL: 38, MS: 38, AR: 38, TN: 36, LA: 35, VA: 32,
  WV: 35, KY: 30, IN: 26, OH: 20, PA: 26, NY: 22, MD: 25, NJ: 22,
  CT: 20, MA: 20, RI: 18, DE: 22, MN: 26, WI: 22, MI: 20, IL: 22,
  IA: 22, MO: 28, NE: 32, ND: 35, KS: 38, NH: 26, VT: 20, ME: 28,
  HI: 55, DC: 10,
};

function normalize(c: string): string {
  return c.toLowerCase().replace(/\s+/g, " ").replace(/\.$/, "").trim();
}

const RAW_OVERRIDES: [string, string, number, number][] = [
  ["FL", "Miami-Dade",    90, 20], ["FL", "Monroe",        93, 18],
  ["FL", "Broward",       88, 20], ["FL", "Palm Beach",    85, 20],
  ["FL", "Pinellas",      88, 22], ["FL", "Hillsborough",  82, 25],
  ["FL", "Lee",           86, 20], ["FL", "Lee County",    86, 20],
  ["FL", "Collier",       87, 22], ["FL", "Charlotte",     82, 20],
  ["FL", "Sarasota",      80, 22], ["FL", "Manatee",       80, 22],
  ["FL", "Escambia",      82, 30], ["FL", "Bay",           80, 28],
  ["FL", "Okaloosa",      78, 30], ["FL", "Santa Rosa",    78, 30],
  ["FL", "Volusia",       78, 24], ["FL", "Brevard",       80, 24],
  ["FL", "Indian River",  78, 22], ["FL", "St Lucie",      78, 22],
  ["FL", "St Lucie County", 78, 22], ["FL", "Saint Lucie", 78, 22],
  ["FL", "Martin",        80, 22], ["FL", "Taylor",        80, 28],
  ["FL", "Citrus",        72, 35], ["FL", "Hernando",      72, 30],
  ["FL", "Pasco",         74, 28], ["FL", "Clay",          70, 28],
  ["FL", "Saint Johns",   72, 26], ["FL", "Duval",         76, 25],
  ["FL", "Nassau",        75, 28], ["FL", "Flagler",       76, 28],

  ["LA", "Orleans",       95, 18], ["LA", "Plaquemines",   94, 18],
  ["LA", "Jefferson",     92, 18], ["LA", "Terrebonne",    93, 18],
  ["LA", "Calcasieu",     86, 22], ["LA", "Saint Tammany", 85, 28],
  ["LA", "Tangipahoa",    84, 30], ["LA", "Washington",    84, 28],
  ["LA", "Lafourche",     92, 18], ["LA", "Iberia",        88, 18],
  ["LA", "Pointe Coupee", 84, 22], ["LA", "Lafayette",     82, 22],

  ["TX", "Harris",        90, 45], ["TX", "Galveston",     92, 38],
  ["TX", "Jefferson",     88, 40], ["TX", "Chambers",      88, 38],
  ["TX", "Fort Bend",     82, 45], ["TX", "Brazoria",      84, 40],
  ["TX", "Montgomery",    75, 50], ["TX", "Waller",        76, 45],
  ["TX", "Liberty",       80, 45], ["TX", "Wharton",       74, 40],
  ["TX", "Newton",        76, 55], ["TX", "Orange",        85, 40],
  ["TX", "Aransas",       84, 42], ["TX", "Nueces",        80, 42],
  ["TX", "San Patricio",  78, 42], ["TX", "Cameron",       80, 45],
  ["TX", "Hidalgo",       72, 48], ["TX", "Bastrop",       45, 80],
  ["TX", "Travis",        45, 72], ["TX", "Hays",          42, 72],
  ["TX", "Comal",         38, 70], ["TX", "Gillespie",     30, 72],
  ["TX", "Llano",         32, 70], ["TX", "Burnet",        36, 68],

  ["CA", "Butte",         35, 96], ["CA", "Lake",          32, 93],
  ["CA", "Sonoma",        40, 90], ["CA", "Napa",          36, 88],
  ["CA", "Mendocino",     42, 92], ["CA", "Trinity",       40, 90],
  ["CA", "Shasta",        36, 90], ["CA", "Los Angeles",   36, 88],
  ["CA", "Ventura",       32, 90], ["CA", "San Diego",     26, 86],
  ["CA", "Santa Barbara", 36, 86], ["CA", "Santa Cruz",    42, 82],
  ["CA", "El Dorado",     36, 88], ["CA", "Nevada",        32, 86],
  ["CA", "Placer",        32, 84], ["CA", "Tuolumne",      30, 90],
  ["CA", "Calaveras",     30, 86], ["CA", "Amador",        30, 84],
  ["CA", "Mariposa",      28, 90], ["CA", "Marin",         42, 84],
  ["CA", "Contra Costa",  46, 80], ["CA", "Alameda",       40, 75],
  ["CA", "San Mateo",     44, 78], ["CA", "Santa Clara",   40, 75],
  ["CA", "Monterey",      38, 80], ["CA", "San Luis Obispo",34, 82],
  ["CA", "Riverside",     28, 82], ["CA", "San Bernardino",30, 80],
  ["CA", "Orange",        32, 78], ["CA", "Kern",          28, 80],
  ["CA", "Plumas",        32, 90], ["CA", "Siskiyou",      36, 90],
  ["CA", "Del Norte",     42, 82], ["CA", "Humboldt",      44, 85],
  ["CA", "Fresno",        35, 78], ["CA", "Tulare",        30, 78],
  ["CA", "Kings",         28, 68], ["CA", "Imperial",      22, 60],
  ["CA", "Madera",        32, 80], ["CA", "Yuba",          38, 82],
  ["CA", "Sutter",        45, 70], ["CA", "Colusa",        38, 72],
  ["CA", "Yolo",          40, 70], ["CA", "Sacramento",    48, 65],
  ["CA", "San Joaquin",   45, 65], ["CA", "Stanislaus",    40, 68],
  ["CA", "Merced",        38, 68], ["CA", "Solano",        44, 72],
  ["CA", "San Francisco", 46, 60], ["CA", "Mono",          25, 78],

  ["CO", "Boulder",       30, 90], ["CO", "Larimer",       30, 90],
  ["CO", "Jefferson",     28, 86], ["CO", "El Paso",       26, 82],
  ["CO", "Teller",        22, 86], ["CO", "Park",          22, 84],
  ["CO", "Eagle",         32, 80], ["CO", "Garfield",      28, 78],
  ["CO", "Gunnison",      26, 76], ["CO", "La Plata",      28, 78],
  ["CO", "Montezuma",     24, 78], ["CO", "Mesa",          26, 75],

  ["OR", "Jackson",       30, 86], ["OR", "Josephine",     28, 88],
  ["OR", "Douglas",       38, 84], ["OR", "Klamath",       28, 82],
  ["OR", "Deschutes",     25, 80], ["OR", "Umatilla",      30, 72],
  ["OR", "Lane",          42, 76], ["OR", "Marion",        40, 70],

  ["WA", "Okanogan",      30, 88], ["WA", "Chelan",        32, 85],
  ["WA", "Yakima",        30, 80], ["WA", "Spokane",       28, 75],
  ["WA", "Grant",         25, 78], ["WA", "Douglas",       26, 78],
  ["WA", "Benton",        26, 75], ["WA", "Lewis",         40, 70],
  ["WA", "Grays Harbor",  52, 65], ["WA", "Whatcom",       44, 65],
  ["WA", "Skagit",        46, 62], ["WA", "Snohomish",     44, 65],
  ["WA", "Pierce",        42, 65], ["WA", "King",          40, 65],
  ["WA", "Clark",         44, 65], ["WA", "Kitsap",        40, 60],
  ["WA", "Thurston",      40, 65], ["WA", "Franklin",      28, 72],

  ["NC", "Brunswick",     82, 35], ["NC", "New Hanover",   82, 35],
  ["NC", "Pender",        80, 35], ["NC", "Onslow",        80, 35],
  ["NC", "Carteret",      84, 32], ["NC", "Craven",        80, 30],
  ["NC", "Pitt",          84, 28], ["NC", "Wayne",         80, 28],
  ["NC", "Edgecombe",     80, 28], ["NC", "Beaufort",      80, 28],

  ["SC", "Horry",         82, 40], ["SC", "Georgetown",    82, 38],
  ["SC", "Charleston",    82, 38], ["SC", "Beaufort",      82, 35],
  ["SC", "Jasper",        80, 35], ["SC", "Dorchester",    75, 38],
  ["SC", "Berkeley",      75, 38], ["SC", "Colleton",      78, 38],

  ["NJ", "Ocean",         82, 20], ["NJ", "Atlantic",      80, 18],
  ["NJ", "Cape May",      84, 18], ["NJ", "Monmouth",      78, 20],
  ["NJ", "Hudson",        72, 18], ["NJ", "Essex",         65, 18],
  ["NJ", "Bergen",        68, 18], ["NJ", "Middlesex",     70, 18],

  ["MD", "Worcester",     78, 28], ["MD", "Somerset",      78, 25],
  ["MD", "Dorchester",    82, 25], ["MD", "Wicomico",      75, 25],
  ["MD", "Caroline",      68, 25], ["MD", "Anne Arundel",  65, 22],
  ["MD", "Baltimore City",60, 20], ["MD", "Baltimore",     55, 22],

  ["VA", "Norfolk",       82, 22], ["VA", "Norfolk City",  82, 22],
  ["VA", "Virginia Beach",80, 22], ["VA", "Virginia Beach City", 80, 22],
  ["VA", "Hampton",       80, 22], ["VA", "Newport News",  78, 22],
  ["VA", "Newport News City", 78, 22], ["VA", "Chesapeake", 78, 22],
  ["VA", "Chesapeake City",78, 22], ["VA", "Poquoson City",80, 22],
  ["VA", "Portsmouth City",78, 22], ["VA", "Northampton",  80, 22],

  ["GA", "Chatham",       78, 42], ["GA", "Bryan",         76, 42],
  ["GA", "Liberty",       75, 42], ["GA", "McIntosh",      76, 42],
  ["GA", "Glynn",         76, 42], ["GA", "Camden",        76, 42],
  ["GA", "Brantley",      72, 42], ["GA", "Ware",          68, 42],

  ["AL", "Mobile",        80, 38], ["AL", "Baldwin",       82, 38],

  ["OH", "Ottawa",        68, 18], ["OH", "Wood",          65, 18],
  ["OH", "Lucas",         65, 18], ["OH", "Sandusky",      62, 18],
  ["OH", "Erie",          62, 18], ["OH", "Meigs",         68, 22],

  ["WV", "Greenbrier",    82, 38], ["WV", "Berkeley",      62, 30],

  ["HI", "Honolulu",      52, 55], ["HI", "Maui",          48, 60],

  ["AZ", "Coconino",      28, 78], ["AZ", "Yavapai",       26, 76],
  ["AZ", "Gila",          28, 78], ["AZ", "Apache",        26, 72],
  ["AZ", "Navajo",        26, 72], ["AZ", "Graham",        24, 70],
  ["AZ", "Cochise",       24, 68], ["AZ", "Pinal",         22, 60],

  ["MT", "Flathead",      35, 78], ["MT", "Lake",          35, 76],
  ["MT", "Sanders",       35, 78], ["MT", "Lincoln",       40, 78],
  ["MT", "Cascade",       32, 70], ["MT", "Ravalli",       30, 78],

  ["ID", "Kootenai",      35, 72], ["ID", "Blaine",        28, 78],
  ["ID", "Ada",           28, 65], ["ID", "Canyon",        28, 62],
];

const OVERRIDES = new Map<string, [number, number]>();
for (const [st, co, f, w] of RAW_OVERRIDES) {
  OVERRIDES.set(`${st}|${normalize(co)}`, [f, w]);
}

export function getRisk(state: string, county: string): CountyRisk {
  const key = `${state}|${normalize(county)}`;
  const ov = OVERRIDES.get(key);
  const floodScore = ov ? ov[0] : (STATE_FLOOD[state] ?? 35);
  const fireScore  = ov ? ov[1] : (STATE_FIRE[state]  ?? 25);
  return {
    floodRisk:  scoreToLevel(floodScore),
    fireRisk:   scoreToLevel(fireScore),
    floodScore,
    fireScore,
  };
}

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  "Very High": { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300" },
  "High":      { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  "Medium":    { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-300" },
  "Low":       { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300" },
  "Very Low":  { bg: "bg-slate-100",  text: "text-slate-500",  border: "border-slate-200" },
};

export function portfolioRiskSummary(loans: { state: string; county: string; upb: number }[]) {
  let floodHighUPB = 0, fireHighUPB = 0, totalUPB = 0;
  const floodCounts: Record<RiskLevel, number> = { "Very High": 0, "High": 0, "Medium": 0, "Low": 0, "Very Low": 0 };
  const fireCounts:  Record<RiskLevel, number> = { "Very High": 0, "High": 0, "Medium": 0, "Low": 0, "Very Low": 0 };

  for (const l of loans) {
    const r = getRisk(l.state, l.county || "");
    totalUPB += l.upb;
    floodCounts[r.floodRisk]++;
    fireCounts[r.fireRisk]++;
    if (r.floodRisk === "Very High" || r.floodRisk === "High") floodHighUPB += l.upb;
    if (r.fireRisk  === "Very High" || r.fireRisk  === "High") fireHighUPB  += l.upb;
  }

  return {
    floodHighPct: totalUPB > 0 ? (floodHighUPB / totalUPB) * 100 : 0,
    fireHighPct:  totalUPB > 0 ? (fireHighUPB  / totalUPB) * 100 : 0,
    floodHighCount: floodCounts["Very High"] + floodCounts["High"],
    fireHighCount:  fireCounts["Very High"]  + fireCounts["High"],
    floodCounts,
    fireCounts,
    totalLoans: loans.length,
  };
}
