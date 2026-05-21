'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, CheckCircle, Circle, ChevronRight, Brain, Play } from 'lucide-react';
import Link from 'next/link';

const ROADMAPS = [
  {
    id: 'beginner',
    title: 'DSA Beginner Path',
    desc: 'Start from zero, build strong foundations',
    emoji: '🌱',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    weeks: 8,
    topics: [
      { id: 't1', title: 'Arrays & Strings', subtopics: ['Array basics', 'Two Pointer', 'Sliding Window', 'Prefix Sum'], problems: 25, color: '#6366f1', icon: '📊' },
      { id: 't2', title: 'Sorting & Searching', subtopics: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Binary Search'], problems: 15, color: '#8b5cf6', icon: '🔍' },
      { id: 't3', title: 'Linked Lists', subtopics: ['Singly LL', 'Doubly LL', 'Circular LL', 'Floyd Cycle'], problems: 18, color: '#06b6d4', icon: '⛓' },
      { id: 't4', title: 'Stacks & Queues', subtopics: ['Stack basics', 'Queue basics', 'Monotonic Stack', 'Priority Queue'], problems: 20, color: '#10b981', icon: '📚' },
      { id: 't5', title: 'Trees', subtopics: ['Binary Tree', 'BST', 'Tree Traversal', 'LCA'], problems: 28, color: '#f59e0b', icon: '🌳' },
      { id: 't6', title: 'Recursion & Backtracking', subtopics: ['Base cases', 'Tree recursion', 'Backtracking template', 'N-Queens'], problems: 15, color: '#ef4444', icon: '🔄' },
    ],
  },
  {
    id: 'intermediate',
    title: 'SDE Interview Ready',
    desc: 'Crack product-based company interviews',
    emoji: '🚀',
    color: 'from-indigo-500/20 to-violet-500/20',
    border: 'border-indigo-500/20',
    weeks: 12,
    topics: [
      { id: 'i1', title: 'Dynamic Programming', subtopics: ['1D DP', '2D DP', 'Knapsack', 'LCS/LIS', 'Interval DP'], problems: 40, color: '#6366f1', icon: '🧩' },
      { id: 'i2', title: 'Graphs', subtopics: ['DFS/BFS', 'Topological Sort', 'Dijkstra', 'Union Find', 'MST'], problems: 35, color: '#8b5cf6', icon: '🕸' },
      { id: 'i3', title: 'Heap & Priority Queue', subtopics: ['Min/Max Heap', 'K-way merge', 'Top K elements', 'Median finder'], problems: 20, color: '#06b6d4', icon: '🏔' },
      { id: 'i4', title: 'Trie', subtopics: ['Insert/Search', 'Word Search', 'Prefix matching', 'Auto-complete'], problems: 12, color: '#10b981', icon: '🌿' },
      { id: 'i5', title: 'Greedy Algorithms', subtopics: ['Activity Selection', 'Interval Scheduling', 'Huffman Coding', 'Jump Game'], problems: 18, color: '#f59e0b', icon: '💡' },
      { id: 'i6', title: 'Bit Manipulation', subtopics: ['Bit operations', 'XOR tricks', 'Bit masking', 'Counting bits'], problems: 15, color: '#ec4899', icon: '⚡' },
    ],
  },
  {
    id: 'faang',
    title: 'FAANG Preparation',
    desc: 'Google, Meta, Amazon, Netflix, Apple level',
    emoji: '🏆',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    weeks: 16,
    topics: [
      { id: 'f1', title: 'Advanced DP', subtopics: ['State machine DP', 'DP on trees', 'Digit DP', 'Bitmask DP'], problems: 30, color: '#f59e0b', icon: '🧮' },
      { id: 'f2', title: 'Advanced Graphs', subtopics: ['SCC', 'Articulation Points', 'Network Flow', 'Bipartite Matching'], problems: 25, color: '#6366f1', icon: '🗺' },
      { id: 'f3', title: 'Segment Trees', subtopics: ['Range queries', 'Lazy propagation', 'BIT/Fenwick Tree'], problems: 15, color: '#8b5cf6', icon: '🌲' },
      { id: 'f4', title: 'System Design Basics', subtopics: ['LRU Cache', 'LFU Cache', 'Design HashMap', 'Design Twitter'], problems: 10, color: '#10b981', icon: '⚙' },
      { id: 'f5', title: 'String Algorithms', subtopics: ['KMP', 'Rabin-Karp', 'Z-algorithm', 'Suffix Array'], problems: 12, color: '#ef4444', icon: '📝' },
      { id: 'f6', title: 'Math & Combinatorics', subtopics: ['Number Theory', 'Modular Arithmetic', 'Probability', 'Game Theory'], problems: 20, color: '#06b6d4', icon: '🔢' },
    ],
  },
];

export default function RoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(ROADMAPS[0]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [aiGoal, setAiGoal] = useState('');
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const toggleTopic = (id: string) => {
    setCompletedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateAIRoadmap = async () => {
    if (!aiGoal.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: aiGoal, currentLevel: 'Beginner', timeAvailable: 10 }),
      });
      const data = await res.json();
      setAiRoadmap(data);
    } catch {}
    finally { setAiLoading(false); }
  };

  const completedCount = selectedRoadmap.topics.filter(t => completedTopics.has(t.id)).length;
  const progress = Math.round((completedCount / selectedRoadmap.topics.length) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-display font-bold text-white">DSA Roadmaps</h1>
        </div>
        <p className="text-gray-500 text-sm">Structured learning paths from beginner to FAANG-ready</p>
      </motion.div>

      {/* AI Roadmap Generator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5 mb-6 border border-violet-500/20 bg-violet-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-violet-400" />
          <h3 className="text-white font-semibold text-sm">AI Roadmap Generator</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">Powered by Claude</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={aiGoal}
            onChange={e => setAiGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateAIRoadmap()}
            placeholder='e.g. "I want to crack Google in 3 months" or "Prepare for competitive programming"'
            className="flex-1 text-sm"
          />
          <button onClick={generateAIRoadmap} disabled={aiLoading} className="btn btn-primary text-sm px-4 gap-2 flex-shrink-0">
            {aiLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Play className="w-3.5 h-3.5" />Generate</>}
          </button>
        </div>
        {aiRoadmap && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
            <div className="text-xs text-gray-400 mb-2">Your personalized {aiRoadmap.totalWeeks}-week plan:</div>
            <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {aiRoadmap.weeks?.slice(0, 6).map((w: any) => (
                <div key={w.week} className="bg-white/4 rounded-lg p-3">
                  <div className="text-xs font-semibold text-indigo-300 mb-1">Week {w.week}: {w.title}</div>
                  <div className="text-[10px] text-gray-500">{w.goal}</div>
                  {w.topics && <div className="text-[10px] text-gray-600 mt-1">{w.topics.join(' · ')}</div>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Roadmap selector */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {ROADMAPS.map(r => (
          <button key={r.id} onClick={() => setSelectedRoadmap(r)} className={`text-left p-4 rounded-xl border transition-all ${selectedRoadmap.id === r.id ? `bg-gradient-to-br ${r.color} ${r.border} shadow-glow-sm` : 'glass-card hover:-translate-y-0.5'}`}>
            <div className="text-2xl mb-2">{r.emoji}</div>
            <div className="text-white font-semibold text-sm">{r.title}</div>
            <div className="text-gray-500 text-xs mt-0.5">{r.desc}</div>
            <div className="text-indigo-400 text-xs mt-2">{r.weeks} weeks · {r.topics.reduce((a, t) => a + t.problems, 0)} problems</div>
          </button>
        ))}
      </div>

      {/* Selected roadmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedRoadmap.id}>
        {/* Progress */}
        <div className="glass-card rounded-xl p-4 mb-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">{selectedRoadmap.title}</span>
              <span className="text-indigo-400 text-sm font-bold">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-2xl font-bold text-white">{completedCount}/{selectedRoadmap.topics.length}</div>
            <div className="text-xs text-gray-500">topics done</div>
          </div>
        </div>

        {/* Topic cards */}
        <div className="space-y-3">
          {selectedRoadmap.topics.map((topic, i) => {
            const done = completedTopics.has(topic.id);
            const locked = i > 0 && !completedTopics.has(selectedRoadmap.topics[i - 1].id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-xl overflow-hidden transition-all ${done ? 'border-emerald-500/20' : locked ? 'opacity-60' : 'hover:border-white/12'}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Step indicator */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <button onClick={() => !locked && toggleTopic(topic.id)} disabled={locked} className="transition-all">
                      {done ? <CheckCircle className="w-7 h-7 text-emerald-400" /> : locked ? <Lock className="w-6 h-6 text-gray-600" /> : <Circle className="w-7 h-7 text-gray-500 hover:text-indigo-400" />}
                    </button>
                    {i < selectedRoadmap.topics.length - 1 && <div className={`w-0.5 h-4 ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: topic.color + '22', border: `1px solid ${topic.color}44` }}>
                    {topic.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${done ? 'text-emerald-400 line-through' : 'text-white'}`}>{topic.title}</span>
                      <span className="text-xs text-gray-500">{topic.problems} problems</span>
                      {done && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">✓ Completed</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.subtopics.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <Link href={`/problems?topic=${encodeURIComponent(topic.title)}`}>
                      <button disabled={locked} className={`btn text-xs px-3 py-1.5 gap-1.5 ${locked ? 'btn-ghost opacity-40 cursor-not-allowed' : 'btn-secondary hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30'}`}>
                        Practice <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
