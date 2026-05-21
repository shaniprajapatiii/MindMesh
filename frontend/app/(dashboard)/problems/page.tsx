'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ExternalLink, CheckCircle, Clock, XCircle, ChevronDown, SlidersHorizontal, Bookmark, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const PLATFORMS = ['All', 'LeetCode', 'Codeforces', 'CodeChef', 'GFG'];
const TOPICS = ['All', 'Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'DP', 'Binary Search', 'Greedy', 'Backtracking', 'Heap', 'Trie', 'Sliding Window', 'Two Pointer'];
const STATUSES = ['All', 'Solved', 'Attempted', 'Unsolved'];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [platform, setPlatform] = useState('All');
  const [topic, setTopic] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 20;

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, difficulty, platform, topic, status, sortBy,
        page: String(page), limit: String(perPage),
      });
      const res = await fetch(`/api/problems?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty, platform, topic, status, sortBy, page]);

  useEffect(() => {
    const t = setTimeout(fetchProblems, 300);
    return () => clearTimeout(t);
  }, [fetchProblems]);

  const toggleBookmark = async (id: string) => {
    await fetch(`/api/problems/${id}/bookmark`, { method: 'POST' });
    setProblems(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
  };

  const markStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/problems/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setProblems(prev => prev.map(p => p.id === id ? { ...p, userStatus: newStatus } : p));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Problems</h1>
        <p className="text-gray-500 text-sm">Browse and track problems from all platforms</p>
      </motion.div>

      {/* Search + filter bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary px-4 gap-2 ${showFilters ? 'border-indigo-500/40 text-indigo-300' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {[difficulty, platform, topic, status].filter(f => f !== 'All').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                {[difficulty, platform, topic, status].filter(f => f !== 'All').length}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm"
          >
            <option value="id">Sort: ID</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="title">Sort: Title</option>
            <option value="acceptance">Sort: Acceptance</option>
          </select>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-xs text-gray-500 mb-2">Difficulty</label>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    difficulty === d ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Platform</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatform(p)} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    platform === p ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    status === s ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Topic</label>
              <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full text-xs">
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span>{total} problems found</span>
        <span>·</span>
        <span className="text-emerald-400">✓ {problems.filter(p => p.userStatus === 'solved').length} solved</span>
        <span>·</span>
        <span className="text-amber-400">⏱ {problems.filter(p => p.userStatus === 'attempted').length} attempted</span>
      </div>

      {/* Problems table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 w-8">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">#</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Title</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Topic</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Platform</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Difficulty</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Acceptance</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="skeleton h-5 rounded" />
                  </td>
                </tr>
              ))
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-500">
                  <Search className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                  <p>No problems found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              problems.map((problem, i) => (
                <motion.tr
                  key={problem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/4 hover:bg-white/2 transition-all group"
                >
                  <td className="px-4 py-3">
                    <button onClick={() => markStatus(problem.id, problem.userStatus === 'solved' ? 'unsolved' : 'solved')} className="transition-all">
                      {problem.userStatus === 'solved' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : problem.userStatus === 'attempted' ? (
                        <Clock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-700 group-hover:text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{problem.number || i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/problems/${problem.id}`} className="text-sm text-gray-200 hover:text-white hover:underline decoration-indigo-500 font-medium transition-colors">
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg">{problem.topic || 'Array'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full platform-${problem.platform?.toLowerCase()}`}>
                      {problem.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                    {problem.acceptance ? `${problem.acceptance}%` : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(problem.id)}
                        className="p-1.5 rounded-lg hover:bg-white/8 transition-all text-gray-600 hover:text-amber-400"
                      >
                        {problem.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/8 transition-all text-gray-600 hover:text-blue-400">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Link href={`/editor?problem=${problem.id}`} className="p-1.5 rounded-lg hover:bg-white/8 transition-all text-gray-600 hover:text-indigo-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(Math.ceil(total / perPage), 8) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs transition-all ${
                    p === page ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/8'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
