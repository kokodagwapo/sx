import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { TourProvider } from "@/context/TourContext";
import { CohiTourPanel } from "@/components/onboarding/TourBubble";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const Landing          = lazy(() => import("@/pages/Landing"));
const LandingLite      = lazy(() => import("@/pages/LandingLite"));
const LoginPage        = lazy(() => import("@/pages/LoginPage"));
const BankCallReport   = lazy(() => import("@/pages/BankCallReport"));
const Step1Geography   = lazy(() => import("@/pages/steps/Step1Geography"));
const Step2SearchLoans = lazy(() => import("@/pages/steps/Step2SearchLoans"));
const Step3CreditMetrics     = lazy(() => import("@/pages/steps/Step3CreditMetrics"));
const Step4PricingSheet      = lazy(() => import("@/pages/steps/Step4PricingSheet"));
const Step5FinancialMetrics  = lazy(() => import("@/pages/steps/Step5FinancialMetrics"));
const Step6aLoanComposition  = lazy(() => import("@/pages/steps/Step6aLoanComposition"));
const Step6bYields           = lazy(() => import("@/pages/steps/Step6bYields"));
const Step6cLoanConcentration = lazy(() => import("@/pages/steps/Step6cLoanConcentration"));
const Step7Schedule  = lazy(() => import("@/pages/steps/Step7Schedule"));
const Step8Summary   = lazy(() => import("@/pages/steps/Step8Summary"));
const Step9Cohorts   = lazy(() => import("@/pages/steps/Step9Cohorts"));
const TapeImport     = lazy(() => import("@/pages/admin/TapeImport"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[hsl(var(--app-bg))]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-200 border-t-sky-500" />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}

function RootLayout() {
  return (
    <AuthProvider>
      <TourProvider>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
        <CohiTourPanel />
      </TourProvider>
    </AuthProvider>
  );
}

function ProtectedOutlet() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/",                   element: <LandingLite /> },
      { path: "/landing",            element: <LandingLite /> },
      { path: "/login",              element: <LoginPage /> },
      { path: "/marketplace",        element: <Landing /> },
      { path: "/bank-call-report",   element: <BankCallReport /> },
      {
        element: <ProtectedOutlet />,
        children: [
          { path: "/step/1",             element: <Step1Geography /> },
          { path: "/step/2",             element: <Step2SearchLoans /> },
          { path: "/step/3",             element: <Step3CreditMetrics /> },
          { path: "/step/4",             element: <Step4PricingSheet /> },
          { path: "/step/5",             element: <Step5FinancialMetrics /> },
          { path: "/step/6a",            element: <Step6aLoanComposition /> },
          { path: "/step/6b",            element: <Step6bYields /> },
          { path: "/step/6c",            element: <Step6cLoanConcentration /> },
          { path: "/step/7",             element: <Step7Schedule /> },
          { path: "/step/8",             element: <Step8Summary /> },
          { path: "/step/9",             element: <Step9Cohorts /> },
          { path: "/admin/tape-import",  element: <TapeImport /> },
        ],
      },
      { path: "*",                   element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
