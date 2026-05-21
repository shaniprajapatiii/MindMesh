'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Lightbulb, Code2, BookOpen, Sparkles, RefreshCw, ChevronRight, Lock, Unlock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'hint' | 'explanation' | 'code' | 'approach';
  hintLevel?: 1 | 2 | 3;
  loading?: boolean;
}

interface HintState {
  level: 0 | 1 | 2 | 3;
  problem: string;
}

const QUICK_PROMPTS = [
  { label: 'Hint 1', desc: 'Thinking direction', icon: '💡', hintLevel: 1 },
  { label: 'Hint 2', desc: 'Approach', icon: '🗺', hintLevel: 2 },
  { label: 'Hint 3', desc: 'Pseudocode', icon: '📋', hintLevel: 3 },
  { label: 'Full Solution', desc: 'Complete code', icon: '✅', hintLevel: null },
  { label: 'Complexity', desc: 'Time & Space', icon: '⏱', hintLevel: null },
  { label: 'Related Problems', desc: 'Similar patterns', icon: '🔗', hintLevel: null },
];

const EXAMPLE_PROBLEMS = [
  'Two Sum', 'Longest Substring Without Repeating Characters', 'Merge Intervals',
  'Binary Tree Level Order', 'Word Ladder', 'LRU Cache', 'Trapping Rain Water',
  'Number of Islands', 'Course Schedule', 'Maximum Subarray'
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hey! I'm your AI DSA Mentor 🧠\n\nI'm here to guide you through problems step-by-step — **without spoiling the solution** unless you ask.\n\nTell me which problem you're working on, and I'll guide you from thinking direction → approach → pseudocode → full solution. You control how much help you get!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProblem, setCurrentProblem] = useState('');
  const [hintState, setHintState] = useState<HintState>({ level: 0, problem: '' });
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string, hintLevel?: number | null) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    const loadingMsg: Message = { id: `loading-${Date.now()}`, role: 'assistant', content: '', loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      let systemContext = `You are an AI DSA mentor. Help the user learn data structures and algorithms through guided hints. Be encouraging and pedagogical.`;
      if (hintLevel === 1) systemContext += ` Give only a thinking direction hint - just guide their thinking without giving approach details.`;
      else if (hintLevel === 2) systemContext += ` Give an approach hint - describe the algorithm approach without code.`;
      else if (hintLevel === 3) systemContext += ` Give pseudocode - show algorithm steps in plain language, no actual code.`;

      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          hintLevel,
          problem: currentProblem,
          history: messages.filter(m => !m.loading).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      setMessages(prev => prev.map(m =>
        m.loading ? {
          ...m,
          loading: false,
          content: data.response || data.message || 'Sorry, I had trouble with that. Please try again.',
          type: data.type,
          hintLevel: hintLevel as any,
        } : m
      ));

      if (messageText.toLowerCase().includes('problem') || hintLevel !== undefined) {
        const match = EXAMPLE_PROBLEMS.find(p => messageText.toLowerCase().includes(p.toLowerCase()));
        if (match) setCurrentProblem(match);
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.loading ? { ...m, loading: false, content: '❌ Connection failed. Please check your internet and try again.' } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Chat cleared! Tell me which problem you want to work on.`,
    }]);
    setCurrentProblem('');
    setHintState({ level: 0, problem: '' });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0f]">
      {/* Sidebar */}
      <div className="w-64 bg-[#111118] border-r border-white/5 flex flex-col flex-shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Mentor</div>
              <div className="text-[10px] text-violet-400">Powered by Claude</div>
            </div>
          </div>
          {currentProblem && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              <div className="text-[10px] text-indigo-400 mb-1">Current Problem</div>
              <div className="text-xs text-white font-medium">{currentProblem}</div>
            </div>
          )}
        </div>

        {/* Hint buttons */}
        <div className="p-3 border-b border-white/5">
          <div className="text-xs text-gray-500 mb-2 font-medium">Quick Actions</div>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt.hintLevel ? `Give me hint level ${prompt.hintLevel} for ${currentProblem || 'the current problem'}` : prompt.label, prompt.hintLevel)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 transition-all text-left group"
              >
                <span className="text-base">{prompt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors">{prompt.label}</div>
                  <div className="text-[10px] text-gray-500">{prompt.desc}</div>
                </div>
                {prompt.hintLevel && (
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    hintState.level >= prompt.hintLevel ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500'
                  }`}>
                    {hintState.level >= prompt.hintLevel ? '✓' : <Lock className="w-2.5 h-2.5" />}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Example problems */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">Try these problems</div>
          <div className="space-y-1">
            {EXAMPLE_PROBLEMS.map(p => (
              <button
                key={p}
                onClick={() => { setCurrentProblem(p); sendMessage(`I want to solve: ${p}`); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-white/5">
          <button onClick={clearChat} className="w-full btn btn-secondary text-xs py-2 gap-2">
            <RefreshCw className="w-3 h-3" /> Clear Chat
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-600'
              }`}>
                {msg.role === 'assistant' ? <Brain className="w-4 h-4 text-white" /> : <span className="text-white text-xs font-bold">U</span>}
              </div>

              {/* Message bubble */}
              <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.hintLevel && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-medium">
                      💡 Hint Level {msg.hintLevel}
                    </span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/20 border border-indigo-500/20 text-white rounded-tr-sm'
                    : 'bg-[#1a1a26] border border-white/8 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-white/5 p-4 bg-[#111118] flex-shrink-0">
          {/* Hint quick buttons (mobile) */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 lg:hidden">
            {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.label, p.hintLevel)} className="btn btn-secondary text-xs px-2.5 py-1.5 flex-shrink-0">
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentProblem ? `Ask about ${currentProblem}...` : 'Ask about a problem or paste it here...'}
                className="w-full resize-none rounded-xl min-h-[44px] max-h-32 py-3 pr-12 text-sm"
                rows={1}
                style={{ lineHeight: '1.5' }}
              />
              <div className="absolute right-3 bottom-2.5 text-xs text-gray-600">⏎ send</div>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 shadow-glow-sm"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-gray-600 text-center">
            💡 Ask for hints progressively — Hint 1 → Hint 2 → Hint 3 → Solution
          </div>
        </div>
      </div>
    </div>
  );
}
