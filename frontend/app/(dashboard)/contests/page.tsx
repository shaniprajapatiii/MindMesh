'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, ExternalLink, RefreshCcw, Trophy, CalendarDays, Radio, ShieldCheck, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { platformsApi } from '@/lib/api';

type Contest = {
  id: string;
  platform: string;
  name: string;
  startTime: string;
  duration: string;
  url: string;
};

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const loadContests = async () => {
    setLoading(true);
    try {
      const data = await platformsApi.contests();
      setContests(data as Contest[]);
    } catch {
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContests(); }, []);

  const grouped = useMemo(() => {
    const now = Date.now();
    return contests.map(contest => ({
      ...contest,
      startsInHours: Math.max(0, Math.round((new Date(contest.startTime).getTime() - now) / 36e5)),
      startsInMinutes: Math.max(0, Math.round((new Date(contest.startTime).getTime() - now) / 6e4)),
    }));
  }, [contests]);

  const handleSync = async (platform: string) => {
    setSyncing(platform);
    try {
      await fetch(`/api/platforms/sync/${platform}`, { method: 'POST' });
      toast.success(`${platform} profile synced`);
    } catch {
      toast.error(`Could not sync ${platform}`);
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-3">
            <CalendarDays className="w-3.5 h-3.5" /> Live contest feed
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Contests</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            Real upcoming contests from Codeforces plus the active LeetCode schedule. Use this page to plan practice and never miss a rating round.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadContests} className="btn btn-secondary gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => handleSync('leetcode')} disabled={syncing === 'leetcode'} className="btn btn-primary gap-2">
            {syncing === 'leetcode' ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Sync LeetCode
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming contests', value: String(contests.length), icon: Trophy },
          { label: 'Active platforms', value: String(new Set(contests.map(c => c.platform)).size), icon: Radio },
          { label: 'Avg. countdown', value: contests.length ? `${Math.round(grouped.reduce((sum, c) => sum + c.startsInMinutes, 0) / contests.length)}m` : '--', icon: Flame },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">{card.label}</div>
                <div className="text-2xl font-bold text-white mt-2">{card.value}</div>
              </div>
              <card.icon className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-5 items-start">
        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
          ) : grouped.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-gray-500">
              No contests available right now.
            </div>
          ) : grouped.map((contest) => (
            <motion.div key={contest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 hover:border-white/12 transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">{contest.platform}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">Starts in {contest.startsInHours}h</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{contest.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(contest.startTime).toLocaleString()}</span>
                    <span>Duration: {contest.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={contest.url} target="_blank" className="btn btn-secondary gap-2">
                    Open <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-2">Why this page exists</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Contest planning reduces missed rounds, improves rating growth, and helps users convert a weekly schedule into a repeatable training habit.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-2">What it solves</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Users can see the next real contests in one place instead of jumping between Codeforces, LeetCode, and platform-specific pages.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-2">Learning benefit</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Calendar visibility improves consistency and gives the recommendation engine a concrete target for revision and warm-up practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}