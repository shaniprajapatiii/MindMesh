'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Brain, Play, RotateCcw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = ['javascript', 'python', 'cpp', 'java'];

const PRESETS = [
  {
    name: 'Two Sum',
    problem: 'Two Sum',
    language: 'javascript',
    approach: 'HashMap lookup with complement tracking',
    input: '[2,7,11,15], 9',
    code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    name: 'Linked List Cycle',
    problem: 'Linked List Cycle',
    language: 'python',
    approach: 'Slow and fast pointers',
    input: 'head = [3,2,0,-4], cycle at index 1',
    code: `class Solution:
    def hasCycle(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False`,
  },
  {
    name: 'Binary Tree BFS',
    problem: 'Binary Tree Level Order Traversal',
    language: 'java',
    approach: 'Queue based breadth-first traversal',
    input: 'root = [3,9,20,null,null,15,7]',
    code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> ans = new ArrayList<>();
        if (root == null) return ans;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            ans.add(level);
        }
        return ans;
    }
}`,
  },
];

export default function DryRunClient() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState('javascript');
  const [problem, setProblem] = useState('Two Sum');
  const [approach, setApproach] = useState('HashMap lookup with complement tracking');
  const [input, setInput] = useState('[2,7,11,15], 9');
  const [code, setCode] = useState(PRESETS[0].code);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);

  const presetNames = useMemo(() => PRESETS.map(p => p.name), []);

  useEffect(() => {
    const preset = searchParams.get('preset');
    const problemParam = searchParams.get('problem');
    if (preset) loadPreset(preset);
    if (problemParam) setProblem(problemParam);
  }, [searchParams]);

  const loadPreset = (name: string) => {
    const preset = PRESETS.find(p => p.name === name);
    if (!preset) return;
    setProblem(preset.problem);
    setLanguage(preset.language);
    setApproach(preset.approach);
    setInput(preset.input);
    setCode(preset.code);
    setResult(null);
    setActiveStep(0);
    toast.success(`Loaded ${preset.name}`);
  };

  const generateTrace = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, code, language, input, approach }),
      });
      const data = await res.json();
      setResult(data);
      setActiveStep(0);
    } catch {
      toast.error('Dry run generation failed');
    } finally {
      setLoading(false);
    }
  };

  const variables = result?.variables || [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs mb-3">
            <Brain className="w-3.5 h-3.5" /> AI + Manual Trace Builder
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Dry Run Visualizer</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            Step through an algorithm the same way you explain it in an interview: state, transition, decision, and result.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8">Linked List</span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8">Tree</span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8">Graph</span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8">DP</span>
        </div>
      </motion.div>

      <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-5 items-start">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {presetNames.map(name => (
              <button
                key={name}
                onClick={() => loadPreset(name)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Problem</span>
              <input value={problem} onChange={e => setProblem(e.target.value)} className="w-full" placeholder="Two Sum" />
            </label>
            <label className="space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Input</span>
              <input value={input} onChange={e => setInput(e.target.value)} className="w-full" placeholder="[2,7,11,15], 9" />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Language</span>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-2 rounded-xl border text-xs capitalize transition-all ${language === lang ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-white/5 border-white/8 text-gray-400 hover:text-white'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Approach</span>
              <input value={approach} onChange={e => setApproach(e.target.value)} className="w-full" placeholder="HashMap + iteration" />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Code</span>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full min-h-[280px] font-mono text-sm resize-none"
              spellCheck={false}
            />
          </label>

          <div className="flex items-center gap-3">
            <button onClick={generateTrace} disabled={loading} className="btn btn-primary gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
              Generate Trace
            </button>
            <button onClick={() => { loadPreset('Two Sum'); setResult(null); }} className="btn btn-secondary gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </motion.div>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-cyan-500/10 bg-cyan-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-white font-semibold text-sm">Trace Overview</h2>
            </div>
            {result ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xl font-bold text-white">{result.title}</div>
                  <div className="text-sm text-gray-400 mt-1">{result.summary}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Pattern</div>
                    <div className="text-sm text-white">{result.pattern}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Complexity</div>
                    <div className="text-sm text-white">{result.complexity?.time} / {result.complexity?.space}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Tracked Variables</div>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((v: any) => (
                      <div key={v.name} className="px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                        <div className="text-xs text-gray-400">{v.name}</div>
                        <div className="text-sm text-white font-medium">{v.value}</div>
                        {v.note && <div className="text-[10px] text-gray-500 mt-1 max-w-40">{v.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 leading-relaxed">
                Load a preset or write your own solution, then generate a dry run trace to see how each step mutates the state.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}