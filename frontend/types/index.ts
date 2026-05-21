// ── User & Auth ───────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  college?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  isPublic: boolean;
  role: string;
  streak: number;
  maxStreak: number;
  xp: number;
  level: number;
  leetcodeId?: string;
  codeforcesId?: string;
  codechefId?: string;
  gfgId?: string;
  githubId?: string;
  leetcodeSolved: number;
  leetcodeEasy: number;
  leetcodeMedium: number;
  leetcodeHard: number;
  cfRating: number;
  codechefRating: number;
  gfgSolved: number;
  badges: string[];
  totalSolved?: number;
  rank?: number;
  createdAt: string;
}

// ── Problem ───────────────────────────────────────────────────────────
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Platform = 'LeetCode' | 'Codeforces' | 'CodeChef' | 'GFG';
export type ProblemStatus = 'solved' | 'attempted' | 'unsolved';

export interface Problem {
  id: string;
  externalId?: string;
  title: string;
  slug?: string;
  number?: number;
  platform: Platform;
  url: string;
  difficulty: Difficulty;
  topic?: string;
  tags: string[];
  description?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string;
  acceptance?: number;
  isPremium: boolean;
  userStatus?: ProblemStatus;
  bookmarked?: boolean;
}

export interface ProblemListResponse {
  problems: Problem[];
  total: number;
  page: number;
  pages: number;
}

// ── Note ──────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  content: string;
  mode: 'simple' | 'markdown';
  tags: string[];
  problemId?: string;
  problemTitle?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Submission ────────────────────────────────────────────────────────
export type SubmissionStatus = 'accepted' | 'wrong_answer' | 'tle' | 'mle' | 'runtime_error';
export type Language = 'javascript' | 'python' | 'cpp' | 'java' | 'go' | 'rust';

export interface Submission {
  id: string;
  problemId: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  runtime?: number;
  memory?: number;
  createdAt: string;
}

export interface RunResult {
  accepted: boolean;
  status: string;
  results: Array<{ input: string; output: string; expected: string; passed: boolean; runtime: number }>;
  runtime: number;
  memory: string;
  error?: string;
}

// ── DSA Sheet ─────────────────────────────────────────────────────────
export interface DSASheet {
  id: string;
  name: string;
  author: string;
  description?: string;
  level?: string;
  url?: string;
  emoji?: string;
  isPublic: boolean;
  total?: number;
}

export interface SheetProblem extends Problem {
  order: number;
  sheetItemId: string;
  solved: boolean;
}

// ── Community ─────────────────────────────────────────────────────────
export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  views: number;
  likes: number;
  replies: number;
  author: { name: string; username: string; avatar?: string };
  timeAgo: string;
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  isPublic: boolean;
  members: number;
  joined: boolean;
  createdBy: string;
}

// ── Analytics ─────────────────────────────────────────────────────────
export interface AnalyticsData {
  totalSolved: number;
  difficultyBreakdown: { Easy: number; Medium: number; Hard: number };
  topicBreakdown: Record<string, { solved: number; easy: number; medium: number; hard: number }>;
  platformBreakdown: Record<string, number>;
  monthlyData: Array<{ month: string; easy: number; medium: number; hard: number }>;
  activityData: Array<{ date: string; count: number }>;
  speedAnalysis: Record<string, { avg: number; count: number }>;
}

// ── Dashboard ─────────────────────────────────────────────────────────
export interface DashboardStats {
  totalSolved: number;
  streak: number;
  maxStreak: number;
  xp: number;
  level: number;
  leetcode: { solved: number; easy: number; medium: number; hard: number };
  codeforces: { rating: number };
  codechef: { rating: number };
  gfg: { solved: number };
}

// ── Contest ───────────────────────────────────────────────────────────
export interface Contest {
  id: string;
  platform: string;
  name: string;
  startTime: string;
  duration: string;
  url: string;
}

// ── Leaderboard ───────────────────────────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  rank: number;
  totalSolved: number;
  streak: number;
  cfRating?: number;
  score: number;
  college?: string;
  isMe: boolean;
}

// ── News ──────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  source: string;
  category: string;
  publishedAt: string;
  trending: boolean;
}
