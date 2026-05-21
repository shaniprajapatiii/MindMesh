'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ExternalLink, ChevronDown, ChevronRight, Search, Plus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const SHEETS = [
  { id: 'striver-az', name: "Striver's A-Z Sheet", author: 'Striver (TakeUForward)', total: 455, color: 'from-indigo-500 to-violet-500', level: 'Comprehensive', url: 'https://takeuforward.org/strivers-a2z-dsa-course' },
  { id: 'love-babbar', name: 'Love Babbar 450', author: 'Love Babbar', total: 450, color: 'from-blue-500 to-cyan-500', level: 'Structured', url: '#' },
  { id: 'blind-75', name: 'Blind 75', author: 'Curated by Community', total: 75, color: 'from-emerald-500 to-teal-500', level: 'Interview Prep', url: '#' },
  { id: 'neetcode-150', name: 'NeetCode 150', author: 'NeetCode', total: 150, color: 'from-amber-500 to-orange-500', level: 'Curated', url: '#' },
  { id: 'fraz-300', name: 'Fraz Sheet', author: 'Mohammad Fraz', total: 300, color: 'from-pink-500 to-rose-500', level: 'Topic-wise', url: '#' },
  { id: 'striver-sde', name: "Striver's SDE Sheet", author: 'Striver', total: 191, color: 'from-purple-500 to-indigo-500', level: 'SDE Prep', url: '#' },
  { id: 'gfg-must', name: 'GFG Must Do', author: 'GeeksforGeeks', total: 200, color: 'from-green-500 to-emerald-500', level: 'Company-wise', url: '#' },
  { id: 'custom', name: 'Custom Sheet', author: 'You', total: 0, color: 'from-gray-500 to-slate-500', level: 'Build Your Own', url: '#' },
];

const TOPIC_CATEGORIES = ['Arrays', 'String', 'Linked List', 'Stack & Queue', 'Tree', 'Graph', 'Recursion & Backtracking', 'Dynamic Programming', 'Binary Search', 'Greedy', 'Bit Manipulation', 'Math'];

// Mock problems for sheet display
const generateProblems = (sheetId: string, count: number) =>
  Array.from({ length: Math.min(count, 20) }, (_, i) => ({
    id: `${sheetId}-${i}`,
    number: i + 1,
    title: ['Two Sum', 'Reverse Linked List', 'Binary Tree Inorder', 'Number of Islands', 'Coin Change', 'Merge Intervals', 'LRU Cache', 'Word Break', 'Serialize Binary Tree', 'Max Path Sum', 'Min Cost Climbing', 'Unique Paths', 'Jump Game', 'Container With Most Water', 'Rotate Image', 'Group Anagrams', 'Valid Parentheses', 'Best Time to Buy', 'Product of Array', 'Maximum Subarray'][i] || `Problem ${i + 1}`,
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as string,
    topic: TOPIC_CATEGORIES[Math.floor(Math.random() * TOPIC_CATEGORIES.length)],
    platform: 'LeetCode',
    url: '#',
    solved: false,
  }));

export default function SheetsPage() {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetProblems, setSheetProblems] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['Arrays']));
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user's sheet progress
    fetch('/api/sheets/progress').then(r => r.json()).then(setProgress).catch(() => {});
  }, []);

  const openSheet = async (sheetId: string) => {
    setSelectedSheet(sheetId);
    setLoading(true);
    try {
      const res = await fetch(`/api/sheets/${sheetId}/problems`);
      if (res.ok) {
        setSheetProblems(await res.json());
      } else {
        // Use mock data
        const sheet = SHEETS.find(s => s.id === sheetId);
        setSheetProblems(generateProblems(sheetId, sheet?.total || 20));
      }
    } catch {
      const sheet = SHEETS.find(s => s.id === sheetId);
      setSheetProblems(generateProblems(sheetId, sheet?.total || 20));
    } finally {
      setLoading(false);
    }
  };

  const toggleProblem = async (problemId: string) => {
    setSheetProblems(prev => prev.map(p => p.id === problemId ? { ...p, solved: !p.solved } : p));
    await fetch(`/api/sheets/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, sheetId: selectedSheet }),
    });
    if (!sheetProblems.find(p => p.id === problemId)?.solved) {
      toast.success('Problem marked as solved! 🎉');
    }
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const currentSheet = SHEETS.find(s => s.id === selectedSheet);
  const solvedCount = sheetProblems.filter(p => p.solved).length;

  const groupedProblems = sheetProblems.reduce((acc: Record<string, any[]>, p) => {
    if (!acc[p.topic]) acc[p.topic] = [];
    acc[p.topic].push(p);
    return acc;
  }, {});

  const filteredProblems = sheetProblems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'solved' ? p.solved : !p.solved);
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">DSA Sheets Hub</h1>
        <p className="text-gray-500 text-sm">All curated sheets. Track your completion.</p>
      </motion.div>

      {!selectedSheet ? (
        // Sheets grid
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SHEETS.map((sheet, i) => {
            const solved = progress[sheet.id] || 0;
            const pct = sheet.total ? Math.round((solved / sheet.total) * 100) : 0;
            return (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openSheet(sheet.id)}
                className="glass-card rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${sheet.color} mb-4`} />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-tight mb-1">{sheet.name}</h3>
                    <p className="text-gray-500 text-xs">{sheet.author}</p>
                  </div>
                  {sheet.id === 'custom' ? (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{sheet.total}</span>
                  )}
                </div>

                <div className="mb-2">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400`}>{sheet.level}</span>
                </div>

                {sheet.total > 0 && (
                  <>
                    <div className="progress-bar mt-3">
                      <div className={`progress-fill bg-gradient-to-r ${sheet.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{solved} / {sheet.total} solved</span>
                      <span className={`text-xs font-medium ${pct > 0 ? 'text-indigo-400' : 'text-gray-600'}`}>{pct}%</span>
                    </div>
                  </>
                )}

                <div className="mt-3 text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">
                  {sheet.id === 'custom' ? 'Create your own →' : 'Open sheet →'}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Sheet detail view
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setSelectedSheet(null)} className="btn btn-secondary text-sm px-3 py-2">← Back</button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{currentSheet?.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{solvedCount} / {currentSheet?.total || sheetProblems.length} solved</span>
                <div className="flex-1 max-w-48 progress-bar">
                  <div className={`progress-fill bg-gradient-to-r ${currentSheet?.color}`} style={{ width: `${Math.round((solvedCount / (currentSheet?.total || sheetProblems.length || 1)) * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-indigo-400">{Math.round((solvedCount / (currentSheet?.total || sheetProblems.length || 1)) * 100)}%</span>
              </div>
            </div>
            <a href={currentSheet?.url} target="_blank" rel="noopener" className="btn btn-secondary text-xs px-3 py-2 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> View Original
            </a>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..." className="pl-8 text-sm py-2" />
            </div>
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              {(['all', 'solved', 'unsolved'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${filterStatus === s ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Problems grouped by topic */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedProblems).map(([topic, problems]) => {
                const topicSolved = problems.filter(p => p.solved).length;
                const isExpanded = expandedTopics.has(topic);
                const displayed = filteredProblems.filter(p => p.topic === topic);
                if (displayed.length === 0) return null;
                return (
                  <div key={topic} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleTopic(topic)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span className="text-white font-medium text-sm">{topic}</span>
                        <span className="text-xs text-gray-500">{problems.length} problems</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.round((topicSolved / problems.length) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-emerald-400">{topicSolved}/{problems.length}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/5">
                        {displayed.map((problem, i) => (
                          <div key={problem.id} className={`flex items-center gap-3 px-4 py-3 border-b border-white/4 last:border-0 hover:bg-white/2 transition-all group ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                            <button onClick={() => toggleProblem(problem.id)} className="flex-shrink-0">
                              {problem.solved
                                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                : <Circle className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />}
                            </button>
                            <span className="text-xs text-gray-500 w-8 flex-shrink-0">{problem.number}</span>
                            <span className={`text-sm flex-1 transition-colors ${problem.solved ? 'line-through text-gray-500' : 'text-gray-200 hover:text-white cursor-pointer'}`}>
                              {problem.title}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                              {problem.difficulty}
                            </span>
                            <a href={problem.url} target="_blank" rel="noopener" className="p-1 text-gray-600 hover:text-blue-400 transition-colors flex-shrink-0">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
