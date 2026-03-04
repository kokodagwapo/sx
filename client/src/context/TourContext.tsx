import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COHI_TOUR_STOPS, type CohiStop } from "@/data/cohiTour";

const SESSION_KEY = "cohi_tour_v2_idx";
const ACTIVE_KEY  = "cohi_tour_v2_active";

export type CohiTourContextValue = {
  isActive: boolean;
  stopIndex: number;
  totalStops: number;
  currentStop: CohiStop | null;
  startTour: () => void;
  endTour: () => void;
  goNext: () => void;
  goPrev: () => void;
  isSpeaking: boolean;
  isThinking: boolean;
  cohiReply: string | null;
  speakCurrent: () => void;
  stopSpeaking: () => void;
  askCohi: (query: string) => Promise<void>;
  clearReply: () => void;
  tourVersion: number;
  tourActive: boolean;
  restartTour: () => void;
};

const CohiTourCtx = createContext<CohiTourContextValue>({
  isActive: false, stopIndex: -1, totalStops: COHI_TOUR_STOPS.length,
  currentStop: null,
  startTour: () => {}, endTour: () => {}, goNext: () => {}, goPrev: () => {},
  isSpeaking: false, isThinking: false, cohiReply: null,
  speakCurrent: () => {}, stopSpeaking: () => {},
  askCohi: async () => {}, clearReply: () => {},
  tourVersion: 0, tourActive: false, restartTour: () => {},
});

async function playTts(text: string, audioRef: React.MutableRefObject<HTMLAudioElement | null>, setIsSpeaking: (v: boolean) => void) {
  try {
    const res = await fetch("/api/cohi/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsSpeaking(true);
    audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
    audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
    audio.play().catch(() => setIsSpeaking(false));
    return true;
  } catch {
    return false;
  }
}

function TourProviderInner({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [stopIndex, setStopIndex] = useState<number>(() => {
    try { return parseInt(sessionStorage.getItem(SESSION_KEY) ?? "-1", 10); } catch { return -1; }
  });
  const [isActive, setIsActive] = useState<boolean>(() => {
    try { return sessionStorage.getItem(ACTIVE_KEY) === "1"; } catch { return false; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [cohiReply, setCohiReply] = useState<string | null>(null);
  const [tourVersion, setTourVersion] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const persist = useCallback((idx: number, active: boolean) => {
    try {
      sessionStorage.setItem(SESSION_KEY, String(idx));
      sessionStorage.setItem(ACTIVE_KEY, active ? "1" : "0");
    } catch {}
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
  }, []);

  const clearReply = useCallback(() => setCohiReply(null), []);

  const speakCurrent = useCallback(async () => {
    if (stopIndex < 0 || stopIndex >= COHI_TOUR_STOPS.length) return;
    stopSpeaking();
    const stop = COHI_TOUR_STOPS[stopIndex];
    await playTts(stop.script, audioRef, setIsSpeaking);
  }, [stopIndex, stopSpeaking]);

  const askCohi = useCallback(async (query: string) => {
    if (!query.trim()) return;
    stopSpeaking();
    setCohiReply(null);
    setIsThinking(true);

    try {
      const chatRes = await fetch("/api/cohi/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      let answer: string;
      if (chatRes.ok) {
        const data = await chatRes.json();
        answer = data.answer ?? "I couldn't find an answer to that one!";
      } else {
        answer = "I'm having trouble connecting right now. Try again in a moment!";
      }

      setCohiReply(answer);
      await playTts(answer, audioRef, setIsSpeaking);
    } catch {
      setCohiReply("Hmm, I couldn't reach my AI brain. Check that the OpenAI API key is configured!");
    } finally {
      setIsThinking(false);
    }
  }, [stopSpeaking]);

  const navigateToStop = useCallback((idx: number) => {
    const stop = COHI_TOUR_STOPS[idx];
    if (stop) navigate(stop.route);
  }, [navigate]);

  const startTour = useCallback(() => {
    stopSpeaking();
    setCohiReply(null);
    setStopIndex(0);
    setIsActive(true);
    setTourVersion(v => v + 1);
    persist(0, true);
    navigate(COHI_TOUR_STOPS[0].route);
  }, [navigate, persist, stopSpeaking]);

  const endTour = useCallback(() => {
    stopSpeaking();
    setCohiReply(null);
    setIsActive(false);
    setStopIndex(-1);
    persist(-1, false);
  }, [persist, stopSpeaking]);

  const goNext = useCallback(() => {
    stopSpeaking();
    setCohiReply(null);
    setStopIndex(prev => {
      const next = prev + 1;
      if (next >= COHI_TOUR_STOPS.length) {
        setIsActive(false);
        persist(-1, false);
        return -1;
      }
      persist(next, true);
      navigateToStop(next);
      return next;
    });
  }, [navigateToStop, persist, stopSpeaking]);

  const goPrev = useCallback(() => {
    stopSpeaking();
    setCohiReply(null);
    setStopIndex(prev => {
      const next = Math.max(0, prev - 1);
      persist(next, true);
      navigateToStop(next);
      return next;
    });
  }, [navigateToStop, persist, stopSpeaking]);

  useEffect(() => {
    return () => { stopSpeaking(); };
  }, [stopSpeaking]);

  const currentStop = (isActive && stopIndex >= 0 && stopIndex < COHI_TOUR_STOPS.length)
    ? COHI_TOUR_STOPS[stopIndex]
    : null;

  return (
    <CohiTourCtx.Provider value={{
      isActive, stopIndex, totalStops: COHI_TOUR_STOPS.length,
      currentStop, startTour, endTour, goNext, goPrev,
      isSpeaking, isThinking, cohiReply,
      speakCurrent, stopSpeaking, askCohi, clearReply,
      tourVersion, tourActive: isActive, restartTour: startTour,
    }}>
      {children}
    </CohiTourCtx.Provider>
  );
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  return <TourProviderInner>{children}</TourProviderInner>;
}

export function useTour() { return useContext(CohiTourCtx); }

export function clearTourStorage() {
  try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(ACTIVE_KEY); } catch {}
}
export function dismissTourStep(_key: string) {}
export function dismissAllTours() { clearTourStorage(); }
export function isTourStepDismissed(_key: string) { return false; }
