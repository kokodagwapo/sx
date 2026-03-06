/** Prefetch step chunks on hover to speed up navigation (steps 6a–9 are heaviest) */
const STEP_PREFETCH: Record<string, () => Promise<unknown>> = {
  "/step/1": () => import("@/pages/steps/Step1Geography"),
  "/step/2": () => import("@/pages/steps/Step2SearchLoans"),
  "/step/3": () => import("@/pages/steps/Step3CreditMetrics"),
  "/step/4": () => import("@/pages/steps/Step4PricingSheet"),
  "/step/5": () => import("@/pages/steps/Step5FinancialMetrics"),
  "/step/6a": () => import("@/pages/steps/Step6aLoanComposition"),
  "/step/6b": () => import("@/pages/steps/Step6bYields"),
  "/step/6c": () => import("@/pages/steps/Step6cLoanConcentration"),
  "/step/7": () => import("@/pages/steps/Step7Schedule"),
  "/step/8": () => import("@/pages/steps/Step8Summary"),
  "/step/9": () => import("@/pages/steps/Step9Cohorts"),
};

const prefetched = new Set<string>();

export function prefetchStep(path: string) {
  if (prefetched.has(path)) return;
  const fn = STEP_PREFETCH[path];
  if (fn) {
    prefetched.add(path);
    fn().catch(() => prefetched.delete(path));
  }
}
