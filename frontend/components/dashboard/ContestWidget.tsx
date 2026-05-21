'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useContestCountdown } from '@/hooks';
import { platformColor } from '@/lib/utils';

interface Contest {
  id: string;
  platform: string;
  name: string;
  startTime: string;
  duration: string;
  url: string;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[9px] text-gray-600 uppercase">{label}</div>
    </div>
  );
}

function ContestItem({ contest }: { contest: Contest }) {
  const time = useContestCountdown(contest.startTime);
  const started = new Date(contest.startTime).getTime() < Date.now();
  const color = platformColor(contest.platform);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/4 last:border-0">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: started ? '#10b981' : color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">{contest.name}</div>
        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
          <span style={{ color }}>{contest.platform}</span>
          <span>·</span>
          <span>{contest.duration}</span>
        </div>
      </div>
      {started ? (
        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
        </span>
      ) : (
        <div className="flex gap-1.5 flex-shrink-0">
          <CountdownUnit value={time.days} label="d" />
          <CountdownUnit value={time.hours} label="h" />
          <CountdownUnit value={time.minutes} label="m" />
        </div>
      )}
      <a href={contest.url} target="_blank" rel="noopener" className="p-1 text-gray-600 hover:text-blue-400 flex-shrink-0">
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

export function ContestWidget() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/platforms/contests').then(r => r.json()).then(setContests).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Upcoming Contests</h3>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-white/4 rounded animate-pulse" />)}</div>
      ) : contests.length === 0 ? (
        <p className="text-gray-600 text-xs text-center py-4">No upcoming contests</p>
      ) : (
        contests.slice(0, 4).map(c => <ContestItem key={c.id} contest={c} />)
      )}
    </div>
  );
}
