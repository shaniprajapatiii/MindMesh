'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Save, Settings2, ChevronDown, Terminal,
  CheckCircle, XCircle, Clock, Maximize2, Minimize2, Copy, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js', defaultCode: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n};` },
  { id: 'python', label: 'Python', ext: 'py', defaultCode: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            comp = target - num\n            if comp in seen:\n                return [seen[comp], i]\n            seen[num] = i\n        return []` },
  { id: 'cpp', label: 'C++', ext: 'cpp', defaultCode: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (mp.count(comp)) return {mp[comp], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};` },
  { id: 'java', label: 'Java', ext: 'java', defaultCode: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}` },
];

const THEMES = ['vs-dark', 'light', 'hc-black'];

const DEFAULT_TEST_CASES = `[2,7,11,15], 9\n[3,2,4], 6\n[3,3], 6`;

function EditorContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get('problem');

  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'testcases' | 'output' | 'description'>('testcases');
  const [problem, setProblem] = useState<any>(null);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (problemId) {
      fetch(`/api/problems/${problemId}`).then(r => r.json()).then(setProblem).catch(() => {});
    }
  }, [problemId]);

  const handleLangChange = (newLang: typeof LANGUAGES[0]) => {
    setLang(newLang);
    setCode(newLang.defaultCode);
  };

  const handleRun = async () => {
    setRunning(true);
    setActiveTab('output');
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang.id, testCases }),
      });
      const data = await res.json();
      setOutput(data);
    } catch (e) {
      setOutput({ error: 'Failed to run code. Check your connection.' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/code/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang.id, problemId }),
      });
      const data = await res.json();
      if (data.accepted) toast.success('✅ Accepted! Great job!');
      else toast.error(`❌ ${data.status}: ${data.message}`);
      setOutput(data);
      setActiveTab('output');
    } catch {
      toast.error('Submission failed');
    } finally {
      setRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const resetCode = () => {
    setCode(lang.defaultCode);
    toast.success('Code reset');
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] bg-[#0a0a0f] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#111118] flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/8 transition-all">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {lang.label}
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a26] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 hidden group-hover:block min-w-[120px]">
              {LANGUAGES.map(l => (
                <button key={l.id} onClick={() => handleLangChange(l)} className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-white/8 transition-all ${lang.id === l.id ? 'text-indigo-300' : 'text-gray-300'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem title */}
          {problem && (
            <span className="text-sm text-gray-400 hidden md:block">
              {problem.number}. {problem.title}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                {problem.difficulty}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyCode} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Copy code">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={resetCode} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Reset code">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Settings">
            <Settings2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 text-sm font-medium transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={running || !problemId}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25 text-sm font-medium transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="flex items-center gap-6 px-4 py-2 border-b border-white/5 bg-[#111118] text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Theme:</span>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="text-xs px-2 py-1">
              {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Font size:</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(f => Math.max(10, f - 1))} className="px-1.5 py-0.5 rounded bg-white/8 text-white text-xs">-</button>
              <span className="text-white text-xs w-6 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(f => Math.min(24, f + 1))} className="px-1.5 py-0.5 rounded bg-white/8 text-white text-xs">+</button>
            </div>
          </div>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem description panel (if problem loaded) */}
        {problem && (
          <div className="hidden lg:flex w-80 xl:w-96 border-r border-white/5 flex-col bg-[#111118] flex-shrink-0">
            <div className="flex border-b border-white/5">
              {['description', 'hints', 'submissions'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2.5 text-xs capitalize transition-all ${activeTab === tab ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 prose prose-invert prose-sm max-w-none">
              <h2 className="text-white font-bold">{problem.number}. {problem.title}</h2>
              <div className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description || '<p>Problem description loading...</p>' }} />
              {problem.examples && problem.examples.map((ex: any, i: number) => (
                <div key={i} className="my-4">
                  <div className="text-gray-400 text-xs font-semibold mb-1">Example {i + 1}:</div>
                  <div className="bg-white/5 rounded-lg p-3 font-mono text-xs text-gray-300">
                    <div><span className="text-gray-500">Input: </span>{ex.input}</div>
                    <div><span className="text-gray-500">Output: </span>{ex.output}</div>
                    {ex.explanation && <div><span className="text-gray-500">Explanation: </span>{ex.explanation}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <MonacoEditor
              height="100%"
              language={lang.id}
              value={code}
              theme={theme}
              onChange={(val) => setCode(val || '')}
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                fontSize,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'gutter',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                contextmenu: true,
                suggest: { showMethods: true, showFunctions: true },
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
              }}
            />
          </div>

          {/* Bottom panel - test cases / output */}
          <div className="border-t border-white/5 bg-[#111118] flex-shrink-0" style={{ height: bottomPanelHeight }}>
            <div className="flex items-center border-b border-white/5">
              {[
                { key: 'testcases', label: 'Test Cases', icon: Terminal },
                { key: 'output', label: 'Output', icon: running ? Clock : output?.accepted ? CheckCircle : XCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-all border-b-2 ${
                    activeTab === key ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${output?.accepted && key === 'output' ? 'text-emerald-400' : ''}`} />
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 pr-3">
                <button onClick={() => setBottomPanelHeight(h => h === 220 ? 380 : 220)} className="p-1 text-gray-600 hover:text-gray-300 transition-all">
                  {bottomPanelHeight > 220 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 overflow-y-auto" style={{ height: bottomPanelHeight - 36 }}>
              {activeTab === 'testcases' && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Enter test cases (one per line, comma-separated args):</div>
                  <textarea
                    value={testCases}
                    onChange={e => setTestCases(e.target.value)}
                    className="w-full h-20 font-mono text-xs resize-none bg-white/5 border border-white/8 rounded-lg p-2 text-gray-300"
                    placeholder="[2,7,11,15], 9"
                  />
                </div>
              )}

              {activeTab === 'output' && (
                <div>
                  {running ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Running code...</span>
                    </div>
                  ) : output ? (
                    <div className="space-y-3">
                      {output.error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <div className="text-red-400 text-xs font-semibold mb-1">Error</div>
                          <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap">{output.error}</pre>
                        </div>
                      ) : (
                        <>
                          <div className={`flex items-center gap-2 text-sm font-semibold ${output.accepted ? 'text-emerald-400' : 'text-red-400'}`}>
                            {output.accepted ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {output.accepted ? 'All test cases passed!' : output.status || 'Wrong Answer'}
                          </div>
                          {output.results?.map((r: any, i: number) => (
                            <div key={i} className={`rounded-lg p-3 border text-xs ${r.passed ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-semibold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {r.passed ? '✓' : '✗'} Case {i + 1}
                                </span>
                                <span className="text-gray-500">{r.runtime}ms</span>
                              </div>
                              <div className="font-mono space-y-1 text-gray-300">
                                <div><span className="text-gray-500">Input: </span>{r.input}</div>
                                <div><span className="text-gray-500">Expected: </span>{r.expected}</div>
                                <div><span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>Output: </span>{r.output}</div>
                              </div>
                            </div>
                          ))}
                          {output.runtime && (
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>Runtime: <span className="text-white">{output.runtime}ms</span></span>
                              <span>Memory: <span className="text-white">{output.memory}MB</span></span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">Run your code to see output</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-64px)] text-gray-500">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
