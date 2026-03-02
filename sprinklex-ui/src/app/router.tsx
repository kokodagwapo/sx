import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

const Step1Geography = lazy(() => import("@/pages/steps/Step1Geography"));
const Step2SearchLoans = lazy(() => import("@/pages/steps/Step2SearchLoans"));
const Step3CreditMetrics = lazy(() => import("@/pages/steps/Step3CreditMetrics"));
const Step4PricingSheet = lazy(() => import("@/pages/steps/Step4PricingSheet"));
const Step5FinancialMetrics = lazy(() => import("@/pages/steps/Step5FinancialMetrics"));
const Step6aLoanComposition = lazy(() => import("@/pages/steps/Step6aLoanComposition"));
const Step6bYields = lazy(() => import("@/pages/steps/Step6bYields"));
const Step6cLoanConcentration = lazy(() => import("@/pages/steps/Step6cLoanConcentration"));
const Step7Schedule = lazy(() => import("@/pages/steps/Step7Schedule"));
const Step8Summary = lazy(() => import("@/pages/steps/Step8Summary"));

function StepFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center bg-[#f8fafc]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/step/1" replace /> },
  {
    path: "/step/1",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step1Geography />
      </Suspense>
    ),
  },
  {
    path: "/step/2",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step2SearchLoans />
      </Suspense>
    ),
  },
  {
    path: "/step/3",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step3CreditMetrics />
      </Suspense>
    ),
  },
  {
    path: "/step/4",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step4PricingSheet />
      </Suspense>
    ),
  },
  {
    path: "/step/5",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step5FinancialMetrics />
      </Suspense>
    ),
  },
  {
    path: "/step/6a",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step6aLoanComposition />
      </Suspense>
    ),
  },
  {
    path: "/step/6b",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step6bYields />
      </Suspense>
    ),
  },
  {
    path: "/step/6c",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step6cLoanConcentration />
      </Suspense>
    ),
  },
  {
    path: "/step/7",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step7Schedule />
      </Suspense>
    ),
  },
  {
    path: "/step/8",
    element: (
      <Suspense fallback={<StepFallback />}>
        <Step8Summary />
      </Suspense>
    ),
  },
  { path: "*", element: <Navigate to="/step/1" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

