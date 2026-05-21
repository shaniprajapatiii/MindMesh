// Typed API client for all backend endpoints

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (email: string) => apiFetch('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string) => apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  register: (data: Record<string, string>) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  forgotPassword: (email: string) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, otp: string, newPassword: string) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
};

// ── Problems ──────────────────────────────────────────────────────────
export const problemsApi = {
  list: (params: Record<string, string>) => apiFetch<{ problems: any[]; total: number }>(`/problems?${new URLSearchParams(params)}`),
  get: (id: string) => apiFetch<any>(`/problems/${id}`),
  updateStatus: (id: string, status: string, timeTaken?: number) => apiFetch(`/problems/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, timeTaken }) }),
  toggleBookmark: (id: string) => apiFetch(`/problems/${id}/bookmark`, { method: 'POST' }),
};

// ── Notes ─────────────────────────────────────────────────────────────
export const notesApi = {
  list: () => apiFetch<any[]>('/notes'),
  create: (data: any) => apiFetch<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/notes/${id}`, { method: 'DELETE' }),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => apiFetch<any>('/dashboard/stats'),
  activity: () => apiFetch<Record<string, number>>('/dashboard/activity'),
  recentProblems: () => apiFetch<any[]>('/dashboard/recent-problems'),
};

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsApi = {
  get: (period: string) => apiFetch<any>(`/analytics?period=${period}`),
};

// ── Sheets ────────────────────────────────────────────────────────────
export const sheetsApi = {
  list: () => apiFetch<any[]>('/sheets'),
  progress: () => apiFetch<Record<string, number>>('/sheets/progress'),
  problems: (sheetId: string) => apiFetch<any[]>(`/sheets/${sheetId}/problems`),
  toggle: (problemId: string, sheetId: string) => apiFetch('/sheets/toggle', { method: 'POST', body: JSON.stringify({ problemId, sheetId }) }),
  create: (data: any) => apiFetch<any>('/sheets', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Profile ───────────────────────────────────────────────────────────
export const profileApi = {
  me: () => apiFetch<any>('/profile/me'),
  update: (data: any) => apiFetch<any>('/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
  public: (username: string) => apiFetch<any>(`/profile/${username}`),
};

// ── Code ──────────────────────────────────────────────────────────────
export const codeApi = {
  run: (code: string, language: string, testCases: string) => apiFetch<any>('/code/run', { method: 'POST', body: JSON.stringify({ code, language, testCases }) }),
  submit: (code: string, language: string, problemId: string) => apiFetch<any>('/code/submit', { method: 'POST', body: JSON.stringify({ code, language, problemId }) }),
  submissions: (problemId: string) => apiFetch<any[]>(`/code/submissions/${problemId}`),
};

// ── AI ────────────────────────────────────────────────────────────────
export const aiApi = {
  mentor: (message: string, history: any[], hintLevel?: number, problem?: string) =>
    apiFetch<any>('/ai/mentor', { method: 'POST', body: JSON.stringify({ message, history, hintLevel, problem }) }),
  generateNotes: (topic: string) => apiFetch<any>('/ai/generate-notes', { method: 'POST', body: JSON.stringify({ topic }) }),
  explainCode: (code: string, language: string) => apiFetch<any>('/ai/explain-code', { method: 'POST', body: JSON.stringify({ code, language }) }),
  optimizeCode: (code: string, language: string) => apiFetch<any>('/ai/optimize-code', { method: 'POST', body: JSON.stringify({ code, language }) }),
  generateTests: (problemDescription: string) => apiFetch<any>('/ai/generate-tests', { method: 'POST', body: JSON.stringify({ problemDescription }) }),
  roadmap: (goal: string, currentLevel: string, timeAvailable: number) =>
    apiFetch<any>('/ai/roadmap', { method: 'POST', body: JSON.stringify({ goal, currentLevel, timeAvailable }) }),
};

// ── Platforms ─────────────────────────────────────────────────────────
export const platformsApi = {
  sync: (platform: string) => apiFetch<any>(`/platforms/sync/${platform}`, { method: 'POST' }),
  contests: () => apiFetch<any[]>('/platforms/contests'),
};

// ── Leaderboard ───────────────────────────────────────────────────────
export const leaderboardApi = {
  get: (params: Record<string, string>) => apiFetch<any>(`/leaderboard?${new URLSearchParams(params)}`),
};

// ── Community ─────────────────────────────────────────────────────────
export const communityApi = {
  posts: (params: Record<string, string>) => apiFetch<any[]>(`/community/posts?${new URLSearchParams(params)}`),
  createPost: (data: any) => apiFetch<any>('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (id: string) => apiFetch<any>(`/community/posts/${id}/like`, { method: 'POST' }),
  replies: (postId: string) => apiFetch<any[]>(`/community/posts/${postId}/replies`),
  addReply: (postId: string, content: string) => apiFetch<any>(`/community/posts/${postId}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
  groups: () => apiFetch<any[]>('/community/groups'),
  createGroup: (data: any) => apiFetch<any>('/community/groups', { method: 'POST', body: JSON.stringify(data) }),
  joinGroup: (id: string) => apiFetch<any>(`/community/groups/${id}/join`, { method: 'POST' }),
  leaveGroup: (id: string) => apiFetch<any>(`/community/groups/${id}/leave`, { method: 'POST' }),
};

// ── News ──────────────────────────────────────────────────────────────
export const newsApi = {
  get: (category?: string) => apiFetch<any[]>(`/news${category && category !== 'All' ? `?category=${category}` : ''}`),
};

// ── Settings ──────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => apiFetch<any>('/settings'),
  update: (data: any) => apiFetch<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: () => apiFetch('/settings/account', { method: 'DELETE' }),
  exportData: () => apiFetch<any>('/settings/export'),
};

// ── Canvas ────────────────────────────────────────────────────────────
export const canvasApi = {
  aiDraw: (prompt: string) => apiFetch<any>('/canvas/ai-draw', { method: 'POST', body: JSON.stringify({ prompt }) }),
};
