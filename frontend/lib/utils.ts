import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ── Tailwind class merger ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Time formatting ───────────────────────────────────────────────────
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Number formatting ─────────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

// ── Difficulty helpers ────────────────────────────────────────────────
export function difficultyColor(d: string): string {
  if (d === 'Easy') return 'text-emerald-400';
  if (d === 'Medium') return 'text-amber-400';
  return 'text-red-400';
}

export function difficultyBg(d: string): string {
  if (d === 'Easy') return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
  if (d === 'Medium') return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
  return 'bg-red-500/15 border-red-500/30 text-red-300';
}

export function platformColor(p: string): string {
  const map: Record<string, string> = {
    LeetCode: '#ffa116', Codeforces: '#1e69d2', CodeChef: '#c8986e', GFG: '#2cae4d',
  };
  return map[p] || '#6366f1';
}

// ── Slug / string helpers ─────────────────────────────────────────────
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ── XP / Level ────────────────────────────────────────────────────────
export function levelFromXp(xp: number): number {
  let level = 1, threshold = 100, increment = 200;
  while (xp >= threshold) { level++; threshold += increment; increment += 100; }
  return level;
}

export function xpToNextLevel(xp: number): { current: number; required: number; progress: number } {
  let level = 1, threshold = 100, prev = 0, increment = 200;
  while (xp >= threshold) { level++; prev = threshold; threshold += increment; increment += 100; }
  return { current: xp - prev, required: threshold - prev, progress: Math.round(((xp - prev) / (threshold - prev)) * 100) };
}

// ── Spaced repetition ─────────────────────────────────────────────────
export function nextReviewDate(easeFactor: number, repetitions: number, quality: number): Date {
  // SM-2 algorithm
  let interval = 1;
  if (repetitions === 0) interval = 1;
  else if (repetitions === 1) interval = 6;
  else interval = Math.round(interval * easeFactor);
  const newEf = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date;
}

// ── Copy to clipboard ─────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

// ── Generate profile share URL ────────────────────────────────────────
export function profileUrl(username: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://mindmesh.dev';
  return `${base}/u/${username}`;
}
