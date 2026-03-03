export type BuyerType = "bank" | "credit_union" | "insurance" | "gse";

export type BuyerEntry = {
  id: string;
  displayName: string;
  shortName: string;
  type: BuyerType;
  fdicSearchName?: string;
  color: "sky" | "indigo" | "violet" | "emerald" | "amber";
  description: string;
  hq: string;
};

export const BUYER_REGISTRY: Record<string, BuyerEntry> = {
  "BNK-001": {
    id: "BNK-001",
    displayName: "JPMorgan Chase Bank, NA",
    shortName: "JPMorgan Chase",
    type: "bank",
    fdicSearchName: "JPMORGAN CHASE BANK",
    color: "sky",
    description: "Largest U.S. bank by assets; primary dealer and leading whole-loan buyer",
    hq: "Columbus, OH",
  },
  "BNK-002": {
    id: "BNK-002",
    displayName: "Bank of America, NA",
    shortName: "Bank of America",
    type: "bank",
    fdicSearchName: "BANK OF AMERICA",
    color: "indigo",
    description: "Second-largest U.S. bank; significant residential mortgage portfolio",
    hq: "Charlotte, NC",
  },
  "BNK-003": {
    id: "BNK-003",
    displayName: "Wells Fargo Bank, NA",
    shortName: "Wells Fargo",
    type: "bank",
    fdicSearchName: "WELLS FARGO BANK",
    color: "violet",
    description: "Major retail and mortgage bank; one of largest portfolio whole-loan buyers",
    hq: "Sioux Falls, SD",
  },
  "CU-001": {
    id: "CU-001",
    displayName: "Pentagon Federal Credit Union",
    shortName: "PenFed CU",
    type: "credit_union",
    color: "emerald",
    description: "NCUA-insured federal credit union; large consumer mortgage acquirer",
    hq: "McLean, VA",
  },
  "INS-001": {
    id: "INS-001",
    displayName: "Pacific Life Insurance Co.",
    shortName: "Pacific Life",
    type: "insurance",
    color: "amber",
    description: "Life insurance company; invests in MBS and whole loans for long-duration yield",
    hq: "Newport Beach, CA",
  },
};

export const BUYER_COLOR_MAP: Record<string, {
  chip: string; chipActive: string; border: string; bg: string; text: string;
}> = {
  sky:    { chip: "bg-sky-100 text-sky-700",    chipActive: "bg-sky-600 text-white",    border: "border-sky-200",    bg: "bg-sky-50",    text: "text-sky-700"    },
  indigo: { chip: "bg-indigo-100 text-indigo-700", chipActive: "bg-indigo-600 text-white", border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-700" },
  violet: { chip: "bg-violet-100 text-violet-700", chipActive: "bg-violet-600 text-white", border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700" },
  emerald:{ chip: "bg-emerald-100 text-emerald-700", chipActive: "bg-emerald-600 text-white", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  amber:  { chip: "bg-amber-100 text-amber-700",  chipActive: "bg-amber-500 text-white",  border: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-700"  },
};
