'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Save, Settings2, Terminal, CheckCircle, XCircle, Clock,
  Maximize2, Minimize2, Copy, Sparkles, Wand2, FileCode2, Bot, Loader2,
  Layers3, FileText, ArrowRight, Braces, ListChecks, Send, ChevronsUpDown, MonitorDot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';
import { aiApi, codeApi, problemsApi } from '@/lib/api';
import { DEFAULT_CODE, LANGUAGES, LanguageId, LanguageSelector } from '@/components/editor/LanguageSelector';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const THEMES = ['vs-dark', 'light', 'hc-black'] as const;
const DEFAULT_TEST_CASES = `[2,7,11,15], 9\n[3,2,4], 6\n[3,3], 6`;

function draftKey(problemId: string | null, language: LanguageId) {
  return `mindmesh-editor:draft:${problemId || 'global'}:${language}`;
}

function testsKey(problemId: string | null) {
  return `mindmesh-editor:tests:${problemId || 'global'}`;
}

function stdinKey(problemId: string | null) {
  return `mindmesh-editor:stdin:${problemId || 'global'}`;
}

function prefsKey() {
  return 'mindmesh-editor:prefs';
}

function examplesToTestCases(examples: any[] | undefined) {
  if (!examples?.length) return DEFAULT_TEST_CASES;
  return examples
    .map(example => {
      if (!example) return null;
      if (typeof example === 'string') return example;
      const input = typeof example.input === 'string' ? example.input : '';
      const output = typeof example.output === 'string' ? example.output : typeof example.expected === 'string' ? example.expected : '';
      if (!input) return null;
      return output ? `${input} => ${output}` : input;
    })
    .filter(Boolean)
    .join('\n') || DEFAULT_TEST_CASES;
}

function loadDraft(problemId: string | null, language: LanguageId) {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(draftKey(problemId, language));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { code?: string; testCases?: string };
  } catch {
    return null;
  }
}

function saveDraft(problemId: string | null, language: LanguageId, code: string, testCases: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(draftKey(problemId, language), JSON.stringify({ code, testCases, updatedAt: new Date().toISOString() }));
  window.localStorage.setItem(testsKey(problemId), testCases);
}

export default function CodeEditor() {
  const [problemId, setProblemId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('mindmesh-editor');
  const [problem, setProblem] = useState<any>(null);
  const [lang, setLang] = useState<LanguageId>('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES);
  const [stdinInput, setStdinInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [assistantOutput, setAssistantOutput] = useState('');
  const [assistantTitle, setAssistantTitle] = useState('AI Assistant');
  const [running, setRunning] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'testcases' | 'terminal' | 'output' | 'assistant'>('terminal');
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'restored'>('saved');
  const [problemLoading, setProblemLoading] = useState(false);
  const editorRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const socketReadyRef = useRef(false);
  const suppressBroadcastRef = useRef(false);
  const broadcastTimerRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setProblemId(new URLSearchParams(window.location.search).get('problem'));
    if (typeof window !== 'undefined') {
      try {
        const prefs = JSON.parse(window.localStorage.getItem(prefsKey()) || '{}');
        if (prefs.theme && THEMES.includes(prefs.theme)) setTheme(prefs.theme);
        if (typeof prefs.fontSize === 'number') setFontSize(prefs.fontSize);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(prefsKey(), JSON.stringify({ theme, fontSize }));
  }, [theme, fontSize]);

  useEffect(() => {
    let cancelled = false;
    const loadProblem = async () => {
      if (!problemId) {
        setProblem(null);
        setRoomId('mindmesh-editor');
        return;
      }
      setProblemLoading(true);
      setRoomId(`problem-${problemId}`);
      try {
        const data = await problemsApi.get(problemId);
        if (!cancelled) setProblem(data);
      } catch {
        if (!cancelled) setProblem(null);
      } finally {
        if (!cancelled) setProblemLoading(false);
      }
    };
    loadProblem();
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = loadDraft(problemId, lang);
    suppressBroadcastRef.current = true;

    if (saved?.code) {
      setCode(saved.code);
      setSaveState('restored');
      toast.success('Draft restored');
    } else {
      setCode(DEFAULT_CODE[lang]);
      setSaveState('saved');
    }

    const storedTests = window.localStorage.getItem(testsKey(problemId));
    const storedStdin = window.localStorage.getItem(stdinKey(problemId));
    if (saved?.testCases) {
      setTestCases(saved.testCases);
    } else if (storedTests) {
      setTestCases(storedTests);
    } else if (problem?.examples?.length) {
      setTestCases(examplesToTestCases(problem.examples));
    } else {
      setTestCases(DEFAULT_TEST_CASES);
    }

    if (storedStdin !== null) {
      setStdinInput(storedStdin);
    }

    window.setTimeout(() => {
      suppressBroadcastRef.current = false;
    }, 0);
  }, [problemId, lang, problem?.examples]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket) return;

    socketReadyRef.current = true;
    socket.emit('join-room', roomId);

    const handleRemoteCode = (payload: any) => {
      if (!payload || payload.roomId !== roomId) return;
      suppressBroadcastRef.current = true;
      if (typeof payload.language === 'string') {
        const nextLang = LANGUAGES.find(item => item.id === payload.language);
        if (nextLang) setLang(nextLang.id as LanguageId);
      }
      if (typeof payload.code === 'string') setCode(payload.code);
      window.setTimeout(() => {
        suppressBroadcastRef.current = false;
      }, 0);
    };

    socket.on('code-update', handleRemoteCode);
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('code-update', handleRemoteCode);
      socketReadyRef.current = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!socketReadyRef.current || suppressBroadcastRef.current) return;
    if (broadcastTimerRef.current) window.clearTimeout(broadcastTimerRef.current);
    broadcastTimerRef.current = window.setTimeout(() => {
      socketRef.current?.emit('code-update', { roomId, code, language: lang });
    }, 250);
    return () => {
      if (broadcastTimerRef.current) window.clearTimeout(broadcastTimerRef.current);
    };
  }, [code, lang, roomId]);

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    setSaveState('dirty');
    saveTimerRef.current = window.setTimeout(() => {
      saveDraft(problemId, lang, code, testCases);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(stdinKey(problemId), stdinInput);
      }
      setSaveState('saved');
    }, 500);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [code, testCases, stdinInput, lang, problemId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveDraft(problemId, lang, code, testCases);
        setSaveState('saved');
        toast.success('Draft saved locally');
      }

      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [problemId, lang, code, testCases]);

  const handleLangChange = (newLang: LanguageId) => {
    saveDraft(problemId, lang, code, testCases);
    setLang(newLang);
    const draft = loadDraft(problemId, newLang);
    suppressBroadcastRef.current = true;
    setCode(draft?.code || DEFAULT_CODE[newLang]);
    window.setTimeout(() => {
      suppressBroadcastRef.current = false;
    }, 0);
  };

  const handleRun = async () => {
    saveDraft(problemId, lang, code, testCases);
    setRunning(true);
    setActiveTab('output');
    try {
      const data = await codeApi.run(code, lang, testCases);
      setOutput(data);
    } catch (e) {
      setOutput({ error: 'Failed to run code. Check your connection.' });
    } finally {
      setRunning(false);
    }
  };

  const handleTerminalRun = async () => {
    saveDraft(problemId, lang, code, testCases);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(stdinKey(problemId), stdinInput);
    }

    setTerminalRunning(true);
    setActiveTab('terminal');
    setTerminalOutput([
      `$ ${lang} run`,
      stdinInput.trim() ? 'stdin: provided' : 'stdin: empty',
      ''
    ].join('\n'));

    try {
      const data = await codeApi.execute(code, lang, stdinInput);
      const sections = [
        `$ ${lang} run`,
        `status: ${data.status || 'Completed'}`,
        data.runtime != null ? `runtime: ${data.runtime}ms` : null,
        data.memory != null ? `memory: ${data.memory}MB` : null,
        '',
        'stdout:',
        data.stdout || '(empty)',
      ];
      if (data.stderr) {
        sections.push('', 'stderr:', data.stderr);
      }
      setTerminalOutput(sections.filter(Boolean).join('\n'));
      setOutput(data);
    } catch (e: any) {
      setTerminalOutput([
        `$ ${lang} run`,
        'execution failed',
        e?.message || 'Failed to execute code.'
      ].join('\n'));
    } finally {
      setTerminalRunning(false);
      setActiveTab('terminal');
    }
  };

  const handleCompile = async () => {
    saveDraft(problemId, lang, code, testCases);
    setCompiling(true);
    setActiveTab('terminal');
    setTerminalOutput([`$ ${lang} compile`, 'compiling...', ''].join('\n'));
    try {
      const data = await codeApi.compile(code, lang);
      const sections = [
        `$ ${lang} compile`,
        `status: ${data.status || 'Completed'}`,
        '',
        'compile output:',
        data.compileOutput || '(no compile output)',
      ];
      if (data.stderr) {
        sections.push('', 'stderr:', data.stderr);
      }
      setTerminalOutput(sections.filter(Boolean).join('\n'));
    } catch (e: any) {
      setTerminalOutput([`$ ${lang} compile`, 'compilation failed', e?.message || 'Failed to compile.'].join('\n'));
    } finally {
      setCompiling(false);
      setActiveTab('terminal');
    }
  };

  const handleSubmit = async () => {
    saveDraft(problemId, lang, code, testCases);
    setRunning(true);
    try {
      const data = await codeApi.submit(code, lang, problemId || '');
      if (data.accepted) toast.success('Accepted. Great job!');
      else toast.error(`Rejected: ${data.message || data.status || 'Try again'}`);
      setOutput(data);
      setActiveTab('output');
    } catch {
      toast.error('Submission failed');
    } finally {
      setRunning(false);
    }
  };

  const handleExplain = async () => {
    setAssistantLoading(true);
    setAssistantTitle('Code Explanation');
    setActiveTab('assistant');
    try {
      const data = await aiApi.explainCode(code, lang);
      setAssistantOutput(data.explanation || 'No explanation returned.');
    } catch {
      setAssistantOutput('AI explanation is unavailable right now.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleOptimize = async () => {
    setAssistantLoading(true);
    setAssistantTitle('Optimization Suggestions');
    setActiveTab('assistant');
    try {
      const data = await aiApi.optimizeCode(code, lang);
      setAssistantOutput(data.suggestions || 'No optimization suggestions returned.');
    } catch {
      setAssistantOutput('AI optimization is unavailable right now.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    const topic = problem?.description || problem?.title || 'the current code';
    setAssistantLoading(true);
    setAssistantTitle('Generated Tests');
    setActiveTab('assistant');
    try {
      const data = await aiApi.generateTests(topic);
      const tests = Array.isArray(data.tests) ? data.tests : [];
      if (tests.length > 0) {
        const formatted = tests
          .map((test: any) => {
            const input = typeof test.input === 'string' ? test.input : '';
            const expected = typeof test.expected === 'string' ? test.expected : '';
            return input ? (expected ? `${input} => ${expected}` : input) : null;
          })
          .filter(Boolean)
          .join('\n');
        if (formatted) {
          setTestCases(formatted);
          toast.success('Test cases loaded into the editor');
        }
      }
      setAssistantOutput(JSON.stringify(tests, null, 2) || '[]');
    } catch {
      setAssistantOutput('AI test generation is unavailable right now.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  const resetCode = () => {
    suppressBroadcastRef.current = true;
    setCode(DEFAULT_CODE[lang]);
    window.setTimeout(() => {
      suppressBroadcastRef.current = false;
    }, 0);
    toast.success('Starter code restored');
  };

  const formatCode = async () => {
    await editorRef.current?.getAction?.('editor.action.formatDocument')?.run?.();
  };

  const clearTerminal = () => {
    setTerminalOutput('');
  };

  const loadSamples = () => {
    if (!problem?.examples?.length) {
      setTestCases(DEFAULT_TEST_CASES);
      toast('Using default sample cases');
      return;
    }
    setTestCases(examplesToTestCases(problem.examples));
    toast.success('Problem examples loaded');
  };

  const lines = useMemo(() => code.split('\n').length, [code]);
  const chars = useMemo(() => code.length, [code]);
  const resultSummary = useMemo(() => {
    if (!output || !output.results?.length) return null;
    const passed = output.results.filter((result: any) => result.passed).length;
    return { passed, total: output.results.length };
  }, [output]);

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] bg-[#0a0a0f] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#111118] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <LanguageSelector value={lang} onChange={handleLangChange} />

          {problem && (
            <div className="hidden md:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-gray-400 min-w-0">
              <span className="truncate max-w-[240px] text-white">{problem.number ? `${problem.number}. ` : ''}{problem.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                {problem.difficulty}
              </span>
            </div>
          )}

          <span className="hidden lg:inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-gray-400">
            Live room: <span className="text-white">{roomId}</span>
          </span>
          <span className={`hidden xl:inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${saveState === 'saved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : saveState === 'restored' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}`}>
            {saveState === 'saved' ? 'Autosaved' : saveState === 'restored' ? 'Draft restored' : 'Unsaved changes'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={copyCode} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Copy code">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={formatCode} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Format code">
            <Braces className="w-4 h-4" />
          </button>
          <button onClick={resetCode} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Reset to starter">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={loadSamples} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Load sample cases">
            <ListChecks className="w-4 h-4" />
          </button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all" title="Settings">
            <Settings2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 text-gray-500 hover:text-gray-200 rounded-lg hover:bg-white/5 transition-all">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
          <button
            onClick={handleExplain}
            disabled={assistantLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/8 text-sm transition-all disabled:opacity-50"
          >
            {assistantLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-violet-400" />}
            Explain
          </button>
          <button
            onClick={handleOptimize}
            disabled={assistantLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/8 text-sm transition-all disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            Optimize
          </button>
          <button
            onClick={handleGenerateTests}
            disabled={assistantLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/8 text-sm transition-all disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Generate Tests
          </button>
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/15 text-yellow-300 hover:bg-yellow-500/20 text-sm font-medium transition-all disabled:opacity-50"
          >
            {compiling ? <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-300" /> : <FileCode2 className="w-3.5 h-3.5 text-yellow-300" />}
            Compile
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 text-sm font-medium transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Run All
          </button>
          <button
            onClick={handleTerminalRun}
            disabled={terminalRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 text-sm font-medium transition-all disabled:opacity-50"
          >
            <MonitorDot className="w-3.5 h-3.5" />
            Run Terminal
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

      {settingsOpen && (
        <div className="flex items-center gap-6 px-4 py-2 border-b border-white/5 bg-[#111118] text-sm flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Theme:</span>
            <select value={theme} onChange={e => setTheme(e.target.value as (typeof THEMES)[number])} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-white outline-none">
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
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{lines} lines</span>
            <span>•</span>
            <span>{chars} chars</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {problem && (
          <div className="hidden lg:flex w-80 xl:w-96 border-r border-white/5 flex-col bg-[#111118] flex-shrink-0">
            <div className="flex border-b border-white/5">
              {['description', 'hints', 'submissions'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab === 'description' ? 'testcases' : activeTab)} className={`flex-1 py-2.5 text-xs capitalize transition-all ${tab === 'description' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 prose prose-invert prose-sm max-w-none">
              <h2 className="text-white font-bold">{problem.number}. {problem.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>{problem.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{problem.platform}</span>
                {problem.topic && <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400">#{problem.topic}</span>}
              </div>
              {problemLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-4 rounded" />
                  <div className="skeleton h-4 rounded w-5/6" />
                  <div className="skeleton h-20 rounded-xl" />
                </div>
              ) : (
                <div className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description || '<p>Problem description loading...</p>' }} />
              )}
              {problem.examples?.map((ex: any, i: number) => (
                <div key={i} className="my-4">
                  <div className="text-gray-400 text-xs font-semibold mb-1">Example {i + 1}:</div>
                  <div className="bg-white/5 rounded-lg p-3 font-mono text-xs text-gray-300">
                    <div><span className="text-gray-500">Input: </span>{ex.input}</div>
                    <div><span className="text-gray-500">Output: </span>{ex.output}</div>
                    {ex.explanation && <div><span className="text-gray-500">Explanation: </span>{ex.explanation}</div>}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 flex gap-3 flex-wrap">
                <Link href={`/problems/${problem.id}`} className="btn btn-secondary text-sm gap-2">
                  <ArrowRight className="w-4 h-4" /> Open problem
                </Link>
                <button onClick={loadSamples} className="btn btn-secondary text-sm gap-2">
                  <Layers3 className="w-4 h-4" /> Load samples
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <MonacoEditor
              height="100%"
              language={lang}
              value={code}
              theme={theme}
              onChange={(val) => setCode(val || '')}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                minimap: { enabled: true },
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
                suggestOnTriggerCharacters: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                formatOnPaste: true,
                formatOnType: true,
                mouseWheelZoom: true,
                tabCompletion: 'on',
                renderWhitespace: 'selection',
                codeLens: true,
              }}
            />
          </div>

          <div className="border-t border-white/5 bg-[#111118] flex-shrink-0" style={{ height: bottomPanelHeight }}>
            <div className="flex items-center border-b border-white/5">
              {[
                { key: 'testcases', label: 'Test Cases', icon: Terminal },
                { key: 'terminal', label: 'Terminal', icon: MonitorDot },
                { key: 'output', label: 'Output', icon: running ? Clock : output?.accepted ? CheckCircle : XCircle },
                { key: 'assistant', label: assistantTitle, icon: assistantLoading ? Loader2 : Sparkles },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-all border-b-2 ${
                    activeTab === key ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${key === 'output' && output?.accepted ? 'text-emerald-400' : ''} ${key === 'assistant' && assistantLoading ? 'animate-spin' : ''}`} />
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 pr-3">
                <button onClick={() => setBottomPanelHeight(h => h === 250 ? 400 : 250)} className="p-1 text-gray-600 hover:text-gray-300 transition-all">
                  {bottomPanelHeight > 250 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 overflow-y-auto" style={{ height: bottomPanelHeight - 36 }}>
              {activeTab === 'testcases' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-xs text-gray-500">Enter test cases. Use <span className="text-gray-300">input =&gt; expected</span> on each line for output checks.</div>
                    <button onClick={loadSamples} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Layers3 className="w-3 h-3" /> Load samples
                    </button>
                  </div>
                  <textarea
                    value={testCases}
                    onChange={e => setTestCases(e.target.value)}
                    className="w-full h-24 font-mono text-xs resize-none bg-white/5 border border-white/8 rounded-lg p-2 text-gray-300"
                    placeholder="[2,7,11,15], 9 => [0,1]"
                  />
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">This panel behaves like a terminal. Put raw stdin on the left and inspect stdout/stderr on the right.</div>
                    <button onClick={clearTerminal} className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1">
                      <ChevronsUpDown className="w-3 h-3" /> Clear output
                    </button>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr,1.2fr]">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-400">stdin</div>
                      <textarea
                        value={stdinInput}
                        onChange={e => setStdinInput(e.target.value)}
                        className="w-full h-48 font-mono text-xs resize-none bg-black/40 border border-cyan-500/15 rounded-xl p-3 text-cyan-50 outline-none focus:border-cyan-400/40"
                        placeholder={problem?.examples?.[0]?.input || 'Enter input here. Example: 5\n1 2 3 4 5'}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={handleTerminalRun} disabled={terminalRunning} className="btn btn-primary text-sm gap-2">
                          {terminalRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Run Input
                        </button>
                        <button onClick={() => setStdinInput(problem?.examples?.[0]?.input || '')} className="btn btn-secondary text-sm gap-2">
                          <Layers3 className="w-4 h-4" /> Load sample input
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-400">terminal</div>
                      <pre className="h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-white/8 bg-[#07070b] p-3 font-mono text-xs leading-6 text-gray-200">
                        {terminalOutput || '$ ready\nType input on the left and run the program.'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'output' && (
                <div>
                  {running ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Running all test cases...</span>
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
                            {output.accepted ? 'All test cases passed' : output.status || 'Wrong Answer'}
                          </div>
                          {resultSummary && (
                            <div className="text-xs text-gray-500">
                              Passed {resultSummary.passed} / {resultSummary.total} cases
                            </div>
                          )}
                          {output.results?.map((result: any, i: number) => (
                            <div key={i} className={`rounded-lg p-3 border text-xs ${result.passed ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-semibold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {result.passed ? '✓' : '✗'} Case {i + 1}
                                </span>
                                <span className="text-gray-500">{result.runtime}ms</span>
                              </div>
                              <div className="font-mono space-y-1 text-gray-300">
                                <div><span className="text-gray-500">Input: </span>{result.input}</div>
                                <div><span className="text-gray-500">Expected: </span>{result.expected}</div>
                                <div><span className={result.passed ? 'text-emerald-400' : 'text-red-400'}>Output: </span>{result.output}</div>
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
                    <div className="text-gray-600 text-sm">Run all cases to see the execution report.</div>
                  )}
                </div>
              )}

              {activeTab === 'assistant' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-white font-semibold">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    {assistantTitle}
                  </div>
                  {assistantLoading ? (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking about the code...
                    </div>
                  ) : assistantOutput ? (
                    <pre className="whitespace-pre-wrap text-xs leading-6 text-gray-300 bg-white/5 border border-white/8 rounded-xl p-4 overflow-x-auto">{assistantOutput}</pre>
                  ) : (
                    <div className="text-gray-600 text-sm">Use Explain, Optimize, or Generate Tests to fill this panel.</div>
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
