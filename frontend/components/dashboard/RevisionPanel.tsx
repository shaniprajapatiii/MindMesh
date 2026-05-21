'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ExternalLink, List, Clock3, Target, ArrowRight } from 'lucide-react';
import { revisionApi } from '@/lib/api';

export default function RevisionPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await revisionApi.list();
        if (active) setItems(data || []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const markDone = async (id: string) => {
    try {
      await revisionApi.markDone(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const getReasonLabel = (reason?: string) => {
    if (reason === 'weak-topic') return 'Weak topic';
    if (reason === 'contest-reminder') return 'Contest reminder';
    return reason || 'Revision';
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-indigo-300" />
          <h3 className="text-white font-semibold text-sm">Revision Queue</h3>
        </div>
        <span className="text-xs text-gray-500">Daily review</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/4 rounded animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-6">You're all caught up 🎉</div>
      ) : (
        <div className="space-y-2">
          {items.slice(0,6).map(item => (
            <div key={item.id} className="rounded-xl border border-white/8 bg-white/3 p-3 hover:border-white/12 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-white font-medium truncate">{item.problemTitle || item.problemId}</span>
                    {item.priority != null && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">P{item.priority}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Target className="w-3 h-3" />{item.topic || 'General'}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" />{getReasonLabel(item.reason)}</span>
                    {item.scheduledAt && <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => markDone(item.id)} className="btn btn-ghost text-xs px-2 py-1 shrink-0">
                  <Check className="w-3 h-3" /> Done
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                {item.problemId ? (
                  <Link href={`/editor?problem=${item.problemId}`} className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                    Open in editor <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[10px] text-gray-600">No linked problem</span>
                )}
                {item.problemId && (
                  <a href={`/problems/${item.problemId}`} className="text-[10px] text-gray-500 hover:text-gray-300 inline-flex items-center gap-1">
                    View problem <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
