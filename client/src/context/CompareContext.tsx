import { createContext, useContext, useState, useCallback } from "react";
import type { Step2Loan } from "@/data/mock/step2Loans";

const MAX_COMPARE = 5;

type CompareContextType = {
  compareList: Step2Loan[];
  addToCompare: (loan: Step2Loan) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
};

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Step2Loan[]>([]);

  const addToCompare = useCallback((loan: Step2Loan) => {
    setCompareList((prev) => {
      if (prev.find((l) => l.id === loan.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, loan];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  const isInCompare = useCallback(
    (id: string) => compareList.some((l) => l.id === id),
    [compareList],
  );

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
