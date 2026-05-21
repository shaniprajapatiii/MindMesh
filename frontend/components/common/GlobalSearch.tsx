'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, X, Code2, FileText, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'problem' | 'note' | 'sheet';
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    const search = async () => {
      setLoading(true);
      try {
        const [probRes, notesRes] = await Promise.all([
          fetch(`/api/problems?search=${debouncedQuery}&limit=5`).then(r => r.json()),
          fetch(`/api/notes`).then(r => r.json()),
        ]);
        const items: SearchResult[] = [];
        (probRes.problems || []).slice(0, 5).forEach((p: any) => items.push({ id: p.id, type: 'problem', title: p.title, subtitle: `${p.platform} · ${p.difficulty}`, href: `/problems/${p.id}` }));
        (notesRes || []).filter((n: any) => n.title.toLowerCase().includes(debouncedQuery.toLowerCase())).slice(0, 3).forEach((n: any) => items.push({ id: n.id, type: 'note', title: n.title, subtitle: 'Note', href: `/notes` }));
        setResults(items);
      } catch {}
      finally { setLoading(false); }
    };
    search();
  }, [debouncedQuery]);

  const icons = { problem: Code2, note: FileText, sheet: Tag };

  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 w-72 text-gray-500 hover:border-white/12 transition-all text-sm">
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search problems, notes...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-[#1a1a26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search problems, notes, sheets..." className="flex-1 bg-transparent border-0 outline-none text-white text-sm placeholder-gray-600" />
                {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {loading && <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>}
                {!loading && results.length === 0 && query && <div className="p-6 text-center text-gray-600 text-sm">No results for "{query}"</div>}
                {!loading && results.length === 0 && !query && (
                  <div className="p-4 text-xs text-gray-600">
                    <p className="mb-2 font-medium text-gray-500">Quick navigation</p>
                    {[{href:'/problems',label:'Browse Problems'},{href:'/notes',label:'My Notes'},{href:'/sheets',label:'DSA Sheets'},{href:'/ai-mentor',label:'AI Mentor'},{href:'/dry-run',label:'Dry Run Visualizer'}].map(l => (
                      <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">{l.label}</Link>
                    ))}
                  </div>
                )}
                {results.map(r => {
                  const Icon = icons[r.type];
                  return (
                    <Link key={r.id} href={r.href} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition-all">
                      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{r.title}</div>
                        {r.subtitle && <div className="text-xs text-gray-500">{r.subtitle}</div>}
                      </div>
                      <span className="text-[10px] text-gray-600 capitalize">{r.type}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-white/5 flex gap-4 text-[10px] text-gray-600">
                <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
