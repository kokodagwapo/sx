import { createContext, useContext, useState, useCallback } from "react";
import { nanoid } from "nanoid";

export type LoanPool = {
  id: string;
  name: string;
  institutionIds: string[];
};

type PoolsContextValue = {
  pools: LoanPool[];
  createPool: (institutionIds: string[]) => LoanPool;
  renamePool: (id: string, name: string) => void;
  deletePool: (id: string) => void;
  addToPool: (poolId: string, institutionId: string) => void;
  removeFromPool: (poolId: string, institutionId: string) => void;
};

const PoolsContext = createContext<PoolsContextValue | null>(null);

export function PoolsProvider({ children }: { children: React.ReactNode }) {
  const [pools, setPools] = useState<LoanPool[]>([]);

  const createPool = useCallback((institutionIds: string[]): LoanPool => {
    const n = pools.length + 1;
    let name = `Loan Pool ${n}`;
    let attempt = n;
    while (pools.some((p) => p.name === name)) {
      attempt++;
      name = `Loan Pool ${attempt}`;
    }
    const pool: LoanPool = { id: nanoid(), name, institutionIds: [...institutionIds] };
    setPools((prev) => [...prev, pool]);
    return pool;
  }, [pools]);

  const renamePool = useCallback((id: string, name: string) => {
    setPools((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const deletePool = useCallback((id: string) => {
    setPools((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToPool = useCallback((poolId: string, institutionId: string) => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId && !p.institutionIds.includes(institutionId)
          ? { ...p, institutionIds: [...p.institutionIds, institutionId] }
          : p
      )
    );
  }, []);

  const removeFromPool = useCallback((poolId: string, institutionId: string) => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? { ...p, institutionIds: p.institutionIds.filter((i) => i !== institutionId) }
          : p
      )
    );
  }, []);

  return (
    <PoolsContext.Provider value={{ pools, createPool, renamePool, deletePool, addToPool, removeFromPool }}>
      {children}
    </PoolsContext.Provider>
  );
}

export function usePools() {
  const ctx = useContext(PoolsContext);
  if (!ctx) throw new Error("usePools must be used inside PoolsProvider");
  return ctx;
}
