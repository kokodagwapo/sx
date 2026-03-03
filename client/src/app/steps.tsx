export type StepId = "1" | "2" | "3" | "4" | "5" | "6a" | "6b" | "6c" | "7" | "8" | "9";

export type StepDef = {
  id: StepId;
  path: `/step/${string}`;
  headerTitle: string;
  tooltip?: string;
};

export const steps: StepDef[] = [
  { id: "1",  path: "/step/1",  headerTitle: "Step 1 - Geographic Search",       tooltip: "Search by Geography" },
  { id: "2",  path: "/step/2",  headerTitle: "Step 2 - Loan Search",              tooltip: "Search for Loans" },
  { id: "3",  path: "/step/3",  headerTitle: "Step 3 - Credit Metrics",           tooltip: "Credit Metrics for Selected Loans" },
  { id: "4",  path: "/step/4",  headerTitle: "Step 4 - Pricing Sheet",            tooltip: "Pricing Sheet for Selected Loans" },
  { id: "5",  path: "/step/5",  headerTitle: "Step 5 - Financial Metrics",        tooltip: "Financial Metrics of Selected Loans" },
  { id: "6a", path: "/step/6a", headerTitle: "Step 6a - Loan Composition",        tooltip: "Current and Pro-forma Loan Composition" },
  { id: "6b", path: "/step/6b", headerTitle: "Step 6b - Historical Loan Yields",  tooltip: "Current and Pro-forma Yields" },
  { id: "6c", path: "/step/6c", headerTitle: "Step 6c - Loan Concentration",      tooltip: "Current and Pro Forma Loan Concentration" },
  { id: "7",  path: "/step/7",  headerTitle: "Step 7 - Loan Schedule",            tooltip: "Schedule of Selected Loans" },
  { id: "8",  path: "/step/8",  headerTitle: "Step 8 - Purchase Summary",         tooltip: "Summary of Purchased Loans" },
  { id: "9",  path: "/step/9",  headerTitle: "Step 9 - Cohort Analysis",          tooltip: "Cohort Analysis by Units, Vintage, Product, Rate & LTV" },
];

export function getPrevNext(stepId: StepId): { prev?: StepDef; next?: StepDef } {
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0) return {};
  return {
    prev: steps[idx - 1],
    next: steps[idx + 1],
  };
}
