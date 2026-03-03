export type BuyerType = "bank" | "credit_union" | "insurance" | "gse";

export type BuyerEntry = {
  id: string;
  displayName: string;
  shortName: string;
  type: BuyerType;
  fdicCert?: number;
  color: "sky" | "indigo" | "violet" | "emerald" | "amber" | "rose";
  description: string;
  hq: string;
};

export const BUYER_REGISTRY: Record<string, BuyerEntry> = {
  "BNK-001": {
    id: "BNK-001", displayName: "JPMorgan Chase Bank, NA", shortName: "JPMorgan Chase",
    type: "bank", fdicCert: 628, color: "sky",
    description: "Largest U.S. bank by assets; primary dealer and leading whole-loan buyer",
    hq: "Columbus, OH",
  },
  "BNK-002": {
    id: "BNK-002", displayName: "Bank of America, NA", shortName: "Bank of America",
    type: "bank", fdicCert: 3510, color: "indigo",
    description: "Second-largest U.S. bank; significant residential mortgage portfolio",
    hq: "Charlotte, NC",
  },
  "BNK-003": {
    id: "BNK-003", displayName: "Wells Fargo Bank, NA", shortName: "Wells Fargo",
    type: "bank", fdicCert: 3511, color: "violet",
    description: "Major retail and mortgage bank; one of largest portfolio whole-loan buyers",
    hq: "Sioux Falls, SD",
  },
  "BNK-004": {
    id: "BNK-004", displayName: "Citibank, NA", shortName: "Citibank",
    type: "bank", fdicCert: 7213, color: "emerald",
    description: "Third-largest U.S. bank; major residential mortgage investor and whole-loan acquirer",
    hq: "New York, NY",
  },
  "BNK-005": {
    id: "BNK-005", displayName: "U.S. Bank, NA", shortName: "U.S. Bank",
    type: "bank", fdicCert: 6548, color: "amber",
    description: "Fifth-largest U.S. bank; active portfolio lender and mortgage-backed securities investor",
    hq: "Cincinnati, OH",
  },
  "BNK-006": {
    id: "BNK-006", displayName: "PNC Bank, NA", shortName: "PNC Bank",
    type: "bank", fdicCert: 9503, color: "rose",
    description: "Major regional bank with significant residential mortgage portfolio and whole-loan acquisition program",
    hq: "Pittsburgh, PA",
  },
  "BNK-007": {
    id: "BNK-007", displayName: "Truist Bank", shortName: "Truist",
    type: "bank", fdicCert: 9846, color: "sky",
    description: "Top-6 U.S. bank formed from BB&T/SunTrust merger; active in Southeast mortgage markets",
    hq: "Charlotte, NC",
  },
  "BNK-008": {
    id: "BNK-008", displayName: "Capital One, NA", shortName: "Capital One",
    type: "bank", fdicCert: 4297, color: "indigo",
    description: "Large diversified bank; selectively acquires residential mortgage loans to complement retail deposits",
    hq: "McLean, VA",
  },
  "BNK-009": {
    id: "BNK-009", displayName: "TD Bank, NA", shortName: "TD Bank",
    type: "bank", fdicCert: 18409, color: "violet",
    description: "U.S. subsidiary of TD Bank Group; major East Coast mortgage lender and portfolio investor",
    hq: "Cherry Hill, NJ",
  },
  "BNK-010": {
    id: "BNK-010", displayName: "Goldman Sachs Bank USA", shortName: "Goldman Sachs",
    type: "bank", fdicCert: 33124, color: "emerald",
    description: "Investment bank and FDIC-insured bank subsidiary; invests in mortgage assets through its banking platform",
    hq: "Salt Lake City, UT",
  },
  "BNK-011": {
    id: "BNK-011", displayName: "Citizens Bank, NA", shortName: "Citizens Bank",
    type: "bank", fdicCert: 57957, color: "amber",
    description: "Major regional bank in the Northeast; active residential mortgage lender and portfolio buyer",
    hq: "Providence, RI",
  },
  "BNK-012": {
    id: "BNK-012", displayName: "Regions Bank", shortName: "Regions",
    type: "bank", fdicCert: 49504, color: "rose",
    description: "Large Southeast regional bank; purchases residential mortgage pools to serve community lending needs",
    hq: "Birmingham, AL",
  },
  "BNK-013": {
    id: "BNK-013", displayName: "Fifth Third Bank", shortName: "Fifth Third",
    type: "bank", fdicCert: 35301, color: "sky",
    description: "Midwest-headquartered bank; active whole-loan buyer with focus on conforming and government mortgages",
    hq: "Cincinnati, OH",
  },
  "BNK-014": {
    id: "BNK-014", displayName: "KeyBank, NA", shortName: "KeyBank",
    type: "bank", fdicCert: 17534, color: "indigo",
    description: "Top-15 U.S. bank; acquires residential mortgage pools through its community banking platform",
    hq: "Cleveland, OH",
  },
  "BNK-015": {
    id: "BNK-015", displayName: "Flagstar Bank, NA", shortName: "Flagstar",
    type: "bank", fdicCert: 30360, color: "violet",
    description: "Specialty mortgage bank; one of the largest non-bank mortgage servicers and a leading whole-loan buyer",
    hq: "Hicksville, NY",
  },
  "CU-001": {
    id: "CU-001", displayName: "Pentagon Federal Credit Union", shortName: "PenFed CU",
    type: "credit_union", color: "emerald",
    description: "NCUA-insured federal credit union; large consumer mortgage acquirer serving military and government employees",
    hq: "McLean, VA",
  },
  "CU-002": {
    id: "CU-002", displayName: "Navy Federal Credit Union", shortName: "Navy Federal",
    type: "credit_union", color: "amber",
    description: "Largest U.S. federal credit union; major mortgage acquirer serving military and defense community",
    hq: "Vienna, VA",
  },
  "CU-003": {
    id: "CU-003", displayName: "USAA Federal Savings Bank", shortName: "USAA Bank",
    type: "bank", fdicCert: 32188, color: "rose",
    description: "Bank serving U.S. military members and their families; major residential mortgage portfolio investor",
    hq: "San Antonio, TX",
  },
  "CU-004": {
    id: "CU-004", displayName: "Boeing Employees Credit Union", shortName: "BECU",
    type: "credit_union", color: "sky",
    description: "Large state-chartered credit union serving Pacific Northwest; acquires residential mortgage pools for member benefit",
    hq: "Tukwila, WA",
  },
  "INS-001": {
    id: "INS-001", displayName: "Pacific Life Insurance Co.", shortName: "Pacific Life",
    type: "insurance", color: "indigo",
    description: "Life insurance company; invests in MBS and whole loans for long-duration yield matching",
    hq: "Newport Beach, CA",
  },
  "INS-002": {
    id: "INS-002", displayName: "New York Life Insurance Co.", shortName: "NY Life",
    type: "insurance", color: "violet",
    description: "Largest mutual life insurer in the U.S.; invests in residential mortgages for long-duration yield matching",
    hq: "New York, NY",
  },
  "INS-003": {
    id: "INS-003", displayName: "MetLife Insurance", shortName: "MetLife",
    type: "insurance", color: "emerald",
    description: "Global life insurer; invests in residential MBS and whole loans as part of its fixed-income strategy",
    hq: "New York, NY",
  },
  "INS-004": {
    id: "INS-004", displayName: "Prudential Financial", shortName: "Prudential",
    type: "insurance", color: "amber",
    description: "Major life and annuity insurer; allocates to residential mortgage investments for liability-duration matching",
    hq: "Newark, NJ",
  },
  "INV-001": {
    id: "INV-001", displayName: "BlackRock Mortgage Strategies", shortName: "BlackRock",
    type: "gse", color: "rose",
    description: "World's largest asset manager; operates multiple mortgage-focused funds acquiring whole loans and MBS",
    hq: "New York, NY",
  },
  "INV-002": {
    id: "INV-002", displayName: "TIAA Financial Services", shortName: "TIAA",
    type: "insurance", color: "sky",
    description: "Teacher Insurance and Annuity Association; long-duration fixed income investor including residential mortgage assets",
    hq: "New York, NY",
  },
};

export const BUYER_COLOR_MAP: Record<string, {
  chip: string; chipActive: string; border: string; bg: string; text: string;
}> = {
  sky:     { chip: "bg-sky-100 text-sky-700",       chipActive: "bg-sky-600 text-white",     border: "border-sky-200",     bg: "bg-sky-50",     text: "text-sky-700"     },
  indigo:  { chip: "bg-indigo-100 text-indigo-700",  chipActive: "bg-indigo-600 text-white",  border: "border-indigo-200",  bg: "bg-indigo-50",  text: "text-indigo-700"  },
  violet:  { chip: "bg-violet-100 text-violet-700",  chipActive: "bg-violet-600 text-white",  border: "border-violet-200",  bg: "bg-violet-50",  text: "text-violet-700"  },
  emerald: { chip: "bg-emerald-100 text-emerald-700",chipActive: "bg-emerald-600 text-white", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  amber:   { chip: "bg-amber-100 text-amber-700",    chipActive: "bg-amber-500 text-white",   border: "border-amber-200",   bg: "bg-amber-50",   text: "text-amber-700"   },
  rose:    { chip: "bg-rose-100 text-rose-700",      chipActive: "bg-rose-600 text-white",    border: "border-rose-200",    bg: "bg-rose-50",    text: "text-rose-700"    },
};
