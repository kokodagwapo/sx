import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Landing from "@/pages/Landing";
import Step1Geography from "@/pages/steps/Step1Geography";
import Step2SearchLoans from "@/pages/steps/Step2SearchLoans";
import Step3CreditMetrics from "@/pages/steps/Step3CreditMetrics";
import Step4PricingSheet from "@/pages/steps/Step4PricingSheet";
import Step5FinancialMetrics from "@/pages/steps/Step5FinancialMetrics";
import Step6aLoanComposition from "@/pages/steps/Step6aLoanComposition";
import Step6bYields from "@/pages/steps/Step6bYields";
import Step6cLoanConcentration from "@/pages/steps/Step6cLoanConcentration";
import Step7Schedule from "@/pages/steps/Step7Schedule";
import Step8Summary from "@/pages/steps/Step8Summary";
import Step9Cohorts from "@/pages/steps/Step9Cohorts";
import TapeImport from "@/pages/admin/TapeImport";

const router = createBrowserRouter([
  { path: "/",           element: <Landing /> },
  { path: "/step/1",     element: <Step1Geography /> },
  { path: "/step/2",     element: <Step2SearchLoans /> },
  { path: "/step/3",     element: <Step3CreditMetrics /> },
  { path: "/step/4",     element: <Step4PricingSheet /> },
  { path: "/step/5",     element: <Step5FinancialMetrics /> },
  { path: "/step/6a",    element: <Step6aLoanComposition /> },
  { path: "/step/6b",    element: <Step6bYields /> },
  { path: "/step/6c",    element: <Step6cLoanConcentration /> },
  { path: "/step/7",     element: <Step7Schedule /> },
  { path: "/step/8",     element: <Step8Summary /> },
  { path: "/step/9",     element: <Step9Cohorts /> },
  { path: "/admin/tape-import", element: <TapeImport /> },
  { path: "*",           element: <Navigate to="/step/1" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
