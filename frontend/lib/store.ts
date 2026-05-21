import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Problem } from '@/types';

// ── User Store ────────────────────────────────────────────────────────
interface UserStore {
  profile: User | null;
  setProfile: (u: User | null) => void;
  updateProfile: (u: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set(s => ({ profile: s.profile ? { ...s.profile, ...updates } : null })),
    }),
    { name: 'mindmesh-user' }
  )
);

// ── Editor Store ──────────────────────────────────────────────────────
interface EditorStore {
  language: string;
  theme: string;
  fontSize: number;
  code: Record<string, string>; // problemId -> code
  setLanguage: (l: string) => void;
  setTheme: (t: string) => void;
  setFontSize: (s: number) => void;
  setCode: (problemId: string, code: string) => void;
  getCode: (problemId: string) => string;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: 14,
      code: {},
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCode: (problemId, code) => set(s => ({ code: { ...s.code, [problemId]: code } })),
      getCode: (problemId) => get().code[problemId] || '',
    }),
    { name: 'mindmesh-editor' }
  )
);

// ── UI Store ──────────────────────────────────────────────────────────
interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  notifications: number;
  setNotifications: (n: number) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      notifications: 0,
      setNotifications: (notifications) => set({ notifications }),
    }),
    { name: 'mindmesh-ui' }
  )
);

// ── Problems Store ────────────────────────────────────────────────────
interface ProblemsStore {
  bookmarks: Set<string>;
  solvedIds: Set<string>;
  toggleBookmark: (id: string) => void;
  markSolved: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  isSolved: (id: string) => boolean;
}

export const useProblemsStore = create<ProblemsStore>()(
  persist(
    (set, get) => ({
      bookmarks: new Set<string>(),
      solvedIds: new Set<string>(),
      toggleBookmark: (id) => set(s => { const b = new Set(s.bookmarks); b.has(id) ? b.delete(id) : b.add(id); return { bookmarks: b }; }),
      markSolved: (id) => set(s => { const solved = new Set(s.solvedIds); solved.add(id); return { solvedIds: solved }; }),
      isBookmarked: (id) => get().bookmarks.has(id),
      isSolved: (id) => get().solvedIds.has(id),
    }),
    {
      name: 'mindmesh-problems',
      storage: { getItem: (k) => { try { const v = localStorage.getItem(k); if (!v) return null; const p = JSON.parse(v); p.state.bookmarks = new Set(p.state.bookmarks || []); p.state.solvedIds = new Set(p.state.solvedIds || []); return p; } catch { return null; } }, setItem: (k, v) => { const p = { ...v, state: { ...v.state, bookmarks: Array.from(v.state.bookmarks), solvedIds: Array.from(v.state.solvedIds) } }; localStorage.setItem(k, JSON.stringify(p)); }, removeItem: (k) => localStorage.removeItem(k) },
    }
  )
);
