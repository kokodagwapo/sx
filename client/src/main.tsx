import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LoanProvider } from "@/context/LoanContext";
import { CompareProvider } from "@/context/CompareContext";
import { CompareTray } from "@/components/compare/CompareTray";
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LoanProvider>
        <CompareProvider>
          <App />
          <CompareTray />
        </CompareProvider>
      </LoanProvider>
    </QueryClientProvider>
  </StrictMode>,
);
