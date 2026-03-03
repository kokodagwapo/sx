import { createContext, useContext, useState, useCallback } from "react";

const STORAGE_KEY = "sprinklex_tour_dismissed";

export function clearTourStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function dismissTourStep(stepKey: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(stepKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function dismissAllTours() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(["__all__"]));
}

export function isTourStepDismissed(stepKey: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    return set.has("__all__") || set.has(stepKey);
  } catch {
    return false;
  }
}

type TourContextValue = {
  tourVersion: number;
  restartTour: () => void;
};

const TourContext = createContext<TourContextValue>({
  tourVersion: 0,
  restartTour: () => {},
});

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourVersion, setTourVersion] = useState(0);

  const restartTour = useCallback(() => {
    clearTourStorage();
    setTourVersion((v) => v + 1);
  }, []);

  return (
    <TourContext.Provider value={{ tourVersion, restartTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
