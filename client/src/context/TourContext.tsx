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
  goToStop: (i: number) => void;
  isSpeaking: boolean;
  isLoadingTts: boolean;
  isPreloaded: boolean;
  isPreloading: boolean;
  timeLeft: number;
  audioDuration: number;
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
  startTour: () => {}, endTour: () => {}, goNext: () => {}, goPrev: () => {}, goToStop: () => {},
  isSpeaking: false, isLoadingTts: false, isPreloaded: false, isPreloading: false,
  timeLeft: 0, audioDuration: 0, isThinking: false, cohiReply: null,
  speakCurrent: () => {}, stopSpeaking: () => {},
  askCohi: async () => {}, clearReply: () => {},
  tourVersion: 0, tourActive: false, restartTour: () => {},
});

async function fetchTtsBlob(text: string): Promise<Blob | null> {
  try {
    const res = await fetch("/api/cohi/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
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
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [cohiReply, setCohiReply] = useState<string | null>(null);
  const [tourVersion, setTourVersion] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadCache = useRef<Map<number, Blob>>(new Map());
  const preloadingIdx = useRef<number | null>(null);

  const persist = useCallback((idx: number, active: boolean) => {
    try {
      sessionStorage.setItem(SESSION_KEY, String(idx));
      sessionStorage.setItem(ACTIVE_KEY, active ? "1" : "0");
    } catch {}
  }, []);

  const preloadStop = useCallback(async (idx: number) => {
    if (idx < 0 || idx >= COHI_TOUR_STOPS.length) return;
    if (preloadCache.current.has(idx)) {
      setIsPreloaded(true);
      setIsPreloading(false);
      return;
    }
    if (preloadingIdx.current === idx) return;
    preloadingIdx.current = idx;
    setIsPreloading(true);
    setIsPreloaded(false);
    const blob = await fetchTtsBlob(COHI_TOUR_STOPS[idx].script);
    if (preloadingIdx.current !== idx) return;
    if (blob) {
      preloadCache.current.set(idx, blob);
      setIsPreloaded(true);
    }
    setIsPreloading(false);
    preloadingIdx.current = null;

    const nextIdx = idx + 1;
    if (nextIdx < COHI_TOUR_STOPS.length && !preloadCache.current.has(nextIdx)) {
      const nextBlob = await fetchTtsBlob(COHI_TOUR_STOPS[nextIdx].script);
      if (nextBlob) preloadCache.current.set(nextIdx, nextBlob);
    }
  }, []);

  useEffect(() => {
    if (isActive && stopIndex >= 0) {
      if (preloadCache.current.has(stopIndex)) {
        setIsPreloaded(true);
        setIsPreloading(false);
      } else {
        setIsPreloaded(false);
      }
      preloadStop(stopIndex);
    }
  }, [isActive, stopIndex, preloadStop]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
    setIsLoadingTts(false);
    setTimeLeft(0);
    setAudioDuration(0);
  }, []);

  const clearReply = useCallback(() => setCohiReply(null), []);

  const playFromBlob = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsSpeaking(true);
    setIsLoadingTts(false);
    audio.onloadedmetadata = () => {
      const dur = Math.ceil(audio.duration);
      setAudioDuration(dur);
      setTimeLeft(dur);
    };
    audio.ontimeupdate = () => {
      const left = Math.ceil(audio.duration - audio.currentTime);
      setTimeLeft(left > 0 ? left : 0);
    };
    audio.onended = () => { setIsSpeaking(false); setTimeLeft(0); setAudioDuration(0); URL.revokeObjectURL(url); };
    audio.onerror = () => { setIsSpeaking(false); setIsLoadingTts(false); setTimeLeft(0); setAudioDuration(0); URL.revokeObjectURL(url); };
    audio.play().catch(() => { setIsSpeaking(false); setTimeLeft(0); setAudioDuration(0); });
  }, []);

  const speakCurrent = useCallback(async () => {
    if (stopIndex < 0 || stopIndex >= COHI_TOUR_STOPS.length) return;
    stopSpeaking();

    const cached = preloadCache.current.get(stopIndex);
    if (cached) {
      playFromBlob(cached);
      return;
    }

    setIsLoadingTts(true);
    const blob = await fetchTtsBlob(COHI_TOUR_STOPS[stopIndex].script);
    if (blob) {
      preloadCache.current.set(stopIndex, blob);
      setIsLoadingTts(false);
      playFromBlob(blob);
    } else {
      setIsLoadingTts(false);
    }
  }, [stopIndex, stopSpeaking, playFromBlob]);

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
      setIsLoadingTts(true);
      const blob = await fetchTtsBlob(answer);
      if (blob) {
        setIsLoadingTts(false);
        playFromBlob(blob);
      } else {
        setIsLoadingTts(false);
      }
    } catch {
      setCohiReply("Hmm, I couldn't reach my AI brain. Check that the OpenAI API key is configured!");
    } finally {
      setIsThinking(false);
    }
  }, [stopSpeaking, playFromBlob]);

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
        persist(-1, false);
        return -1;
      }
      persist(next, true);
      return next;
    });
  }, [persist, stopSpeaking]);

  const goPrev = useCallback(() => {
    stopSpeaking();
    setCohiReply(null);
    setStopIndex(prev => {
      const next = Math.max(0, prev - 1);
      persist(next, true);
      return next;
    });
  }, [persist, stopSpeaking]);

  const goToStop = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(COHI_TOUR_STOPS.length - 1, i));
    stopSpeaking();
    setCohiReply(null);
    setStopIndex(clamped);
    persist(clamped, true);
  }, [persist, stopSpeaking]);

  useEffect(() => {
    return () => { stopSpeaking(); };
  }, [stopSpeaking]);

  useEffect(() => {
    if (!isActive || stopIndex < 0 || stopIndex >= COHI_TOUR_STOPS.length) return;
    navigate(COHI_TOUR_STOPS[stopIndex].route);
  }, [isActive, stopIndex, navigate]);

  useEffect(() => {
    if (stopIndex === -1) setIsActive(false);
  }, [stopIndex]);

  const currentStop = (isActive && stopIndex >= 0 && stopIndex < COHI_TOUR_STOPS.length)
    ? COHI_TOUR_STOPS[stopIndex]
    : null;

  return (
    <CohiTourCtx.Provider value={{
      isActive, stopIndex, totalStops: COHI_TOUR_STOPS.length,
      currentStop, startTour, endTour, goNext, goPrev, goToStop,
      isSpeaking, isLoadingTts, isPreloaded, isPreloading,
      timeLeft, audioDuration, isThinking, cohiReply,
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

