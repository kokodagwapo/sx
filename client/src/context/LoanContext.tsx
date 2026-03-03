import { createContext, useContext, useState } from "react";
import type { LoanRecord } from "@/data/types/loanRecord";

type LoanContextType = {
  importedLoans: LoanRecord[] | null;
  setImportedLoans: (loans: LoanRecord[]) => void;
  clearImportedLoans: () => void;
};

const LoanContext = createContext<LoanContextType>({
  importedLoans: null,
  setImportedLoans: () => {},
  clearImportedLoans: () => {},
});

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [importedLoans, setImportedLoansState] = useState<LoanRecord[] | null>(null);

  return (
    <LoanContext.Provider
      value={{
        importedLoans,
        setImportedLoans: setImportedLoansState,
        clearImportedLoans: () => setImportedLoansState(null),
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  return useContext(LoanContext);
}
