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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export function fetchUsCounties() {
  return getJson<LoanGeoRecord[]>("/api/geo/counties");
}

export function fetchStateCounties(stateFips: string) {
  return getJson<LoanGeoRecord[]>(`/api/geo/state/${encodeURIComponent(stateFips)}/counties`);
}

