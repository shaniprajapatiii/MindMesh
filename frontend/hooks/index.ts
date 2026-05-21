import { useState, useEffect, useCallback, useRef } from 'react';

// ── useDebounce ───────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── useLocalStorage ───────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : initial; }
    catch { return initial; }
  });
  const set = useCallback((val: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

// ── useApi ────────────────────────────────────────────────────────────
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [url]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

// ── useKeyboard ───────────────────────────────────────────────────────
export function useKeyboard(key: string, callback: () => void, meta = false) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && (!meta || e.metaKey || e.ctrlKey)) { e.preventDefault(); callback(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, meta]);
}

// ── useClickOutside ───────────────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
}

// ── useTimer ──────────────────────────────────────────────────────────
export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const start = useRef<number | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    start.current = Date.now() - elapsed * 1000;
    setRunning(true);
    interval.current = setInterval(() => setElapsed(Math.floor((Date.now() - start.current!) / 1000)), 1000);
  }, [elapsed]);

  const stopTimer = useCallback(() => {
    setRunning(false);
    if (interval.current) clearInterval(interval.current);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsed(0);
  }, [stopTimer]);

  useEffect(() => () => { if (interval.current) clearInterval(interval.current); }, []);

  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  return { elapsed, running, fmt, startTimer, stopTimer, resetTimer };
}

// ── useWindowSize ─────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

// ── useContestCountdown ───────────────────────────────────────────────
export function useContestCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}
