export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ProblemFilters extends PaginationQuery {
  search?: string;
  difficulty?: string;
  platform?: string;
  topic?: string;
  status?: string;
  sortBy?: string;
}

export interface RunCodeRequest {
  code: string;
  language: string;
  testCases?: string;
}

export interface SubmitCodeRequest {
  code: string;
  language: string;
  problemId: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  mode: 'simple' | 'markdown';
  tags?: string[];
  problemId?: string;
  problemTitle?: string;
  pinned?: boolean;
}

export interface SyncResult {
  success: boolean;
  platform: string;
  solved?: number;
  rating?: number;
  message?: string;
}
