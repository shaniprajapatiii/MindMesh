'use client';
import Link from 'next/link';
import { CheckCircle, Circle, Clock, Bookmark, BookmarkCheck, ExternalLink, Code2 } from 'lucide-react';
import { Problem } from '@/types';
import { difficultyBg, platformColor } from '@/lib/utils';

interface ProblemCardProps {
  problem: Problem;
  onStatusChange?: (id: string, status: string) => void;
  onBookmark?: (id: string) => void;
  view?: 'table-row' | 'card';
}

export function ProblemStatusIcon({ status }: { status?: string }) {
  if (status === 'solved') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'attempted') return <Clock className="w-4 h-4 text-amber-400" />;
  return <Circle className="w-4 h-4 text-gray-700" />;
}

export function ProblemCard({ problem, onStatusChange, onBookmark }: ProblemCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 hover:border-white/12 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button onClick={() => onStatusChange?.(problem.id, problem.userStatus === 'solved' ? 'unsolved' : 'solved')}
            className="mt-0.5 flex-shrink-0">
            <ProblemStatusIcon status={problem.userStatus} />
          </button>
          <div className="flex-1 min-w-0">
            <Link href={`/problems/${problem.id}`}
              className="text-sm font-medium text-gray-200 hover:text-white hover:underline decoration-indigo-500 transition-colors line-clamp-1">
              {problem.number ? `${problem.number}. ` : ''}{problem.title}
            </Link>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${difficultyBg(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500" style={{ color: platformColor(problem.platform) }}>
                {problem.platform}
              </span>
              {problem.topic && <span className="text-[10px] text-gray-600">#{problem.topic}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onBookmark?.(problem.id)}
            className={`p-1.5 rounded-lg transition-all ${problem.bookmarked ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'} hover:bg-white/5`}>
            {problem.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
          <a href={problem.url} target="_blank" rel="noopener"
            className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-white/5 transition-all">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link href={`/editor?problem=${problem.id}`}
            className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-white/5 transition-all">
            <Code2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
