export type SearchResult = {
  type: "route" | "section";
  title: string;
  path: string;
  keywords: string[];
};

/** Search index: routes + keywords for each step */
export const searchIndex: SearchResult[] = [
  { type: "route", title: "Step 1 - Geographic Search", path: "/step/1", keywords: ["geography", "map", "state", "county", "census tract", "location", "drilldown"] },
  { type: "route", title: "Step 2 - Loan Search", path: "/step/2", keywords: ["search", "loans", "product", "interest rate", "occupancy", "purpose", "filter"] },
  { type: "route", title: "Step 3 - Credit Metrics", path: "/step/3", keywords: ["credit", "ltv", "fico", "dti", "metrics", "distribution"] },
  { type: "route", title: "Step 4 - Pricing Sheet", path: "/step/4", keywords: ["pricing", "sheet", "table", "upb", "rate", "base price", "final price", "llpa"] },
  { type: "route", title: "Step 5 - Financial Metrics", path: "/step/5", keywords: ["financial", "balance sheet", "income", "yield", "amortization"] },
  { type: "route", title: "Step 6a - Loan Composition", path: "/step/6a", keywords: ["composition", "pro forma", "loan types", "narrative"] },
  { type: "route", title: "Step 6b - Yields", path: "/step/6b", keywords: ["yields", "historical", "portfolio", "bond equivalent"] },
  { type: "route", title: "Step 6c - Loan Concentration", path: "/step/6c", keywords: ["concentration", "tier 1", "leverage", "pools"] },
  { type: "route", title: "Step 7 - Loan Schedule", path: "/step/7", keywords: ["schedule", "loan detail", "loan amount", "city", "state", "property"] },
  { type: "route", title: "Step 8 - Purchase Summary", path: "/step/8", keywords: ["summary", "purchased", "composition", "credit", "wac", "loan term"] },
];

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return searchIndex.filter((item) => {
    const searchable = [item.title, ...item.keywords].join(" ").toLowerCase();
    return terms.every((t) => searchable.includes(t));
  });
}
