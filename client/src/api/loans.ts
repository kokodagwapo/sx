export type LoanListItem = {
  id: string;
  tvm: string;
  source: string;
  productType: string;
  loanType: string;
  interestRateBucket: string;
  occupancy: string;
  purpose: string;
  propertyType: string;
  state: string;
  county: string;
  city: string;
  upb: number;
  loanAmount: number;
  rate: number;
  duration: number;
  status: string;
  units: number;
  dti: number;
  ltv: number;
  cltv: number;
  fico: number;
  firstPaymentDate: string;
  lienPosition: string;
  propertyAddress: string;
  term: number;
  buyerId?: string;
};

export type LoanSearchResponse = {
  items: LoanListItem[];
  nextCursor: string | null;
  total: number;
};

export type LoanAggregationsResponse = {
  total: number;
  totalUpb: number;
  wac: number;
  wad: number;
  waFico: number;
  waLtv: number;
  waDti: number;
  avgBalance: number;
  byStatus: Record<string, { count: number; upb: number }>;
  byInterestRateBucket: Record<string, number>;
  byState: Record<string, number>;
  byProductType: Record<string, number>;
  byPurpose: Record<string, number>;
  byLoanType: Record<string, number>;
};

export type LoanSearchParams = {
  q?: string;
  cursor?: string | null;
  limit?: number;
  sort?: string; // field:dir
  filters?: Record<string, string[]>;
  ranges?: Record<string, Array<[number, number]>>;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export function fetchLoansPage(params: LoanSearchParams): Promise<LoanSearchResponse> {
  const u = new URL("/api/loans/search", window.location.origin);
  if (params.q) u.searchParams.set("q", params.q);
  if (params.cursor) u.searchParams.set("cursor", params.cursor);
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.sort) u.searchParams.set("sort", params.sort);
  if (params.filters && Object.keys(params.filters).length) {
    u.searchParams.set("filters", JSON.stringify(params.filters));
  }
  if (params.ranges && Object.keys(params.ranges).length) {
    u.searchParams.set("ranges", JSON.stringify(params.ranges));
  }
  return getJson<LoanSearchResponse>(u.pathname + u.search);
}

export function fetchLoanDetail(id: string): Promise<LoanListItem> {
  return getJson<LoanListItem>(`/api/loans/${encodeURIComponent(id)}`);
}

export function fetchLoanAggregations(params: Omit<LoanSearchParams, "cursor" | "limit">): Promise<LoanAggregationsResponse> {
  const u = new URL("/api/loans/aggregations", window.location.origin);
  if (params.q) u.searchParams.set("q", params.q);
  if (params.sort) u.searchParams.set("sort", params.sort);
  if (params.filters && Object.keys(params.filters).length) {
    u.searchParams.set("filters", JSON.stringify(params.filters));
  }
  if (params.ranges && Object.keys(params.ranges).length) {
    u.searchParams.set("ranges", JSON.stringify(params.ranges));
  }
  return getJson<LoanAggregationsResponse>(u.pathname + u.search);
}

