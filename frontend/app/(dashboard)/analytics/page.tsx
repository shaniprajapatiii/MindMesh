'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Target, Zap, Award, AlertTriangle, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';

const TOPIC_COLORS: Record<string, string> = {
  'Arrays': '#6366f1', 'Strings': '#8b5cf6', 'Linked List': '#06b6d4',
  'Trees': '#10b981', 'Graphs': '#f59e0b', 'DP': '#ef4444',
  'Backtracking': '#ec4899', 'Binary Search': '#84cc16', 'Heap': '#f97316',
  'Stack/Queue': '#14b8a6', 'Greedy': '#a78bfa', 'Two Pointer': '#22d3ee',
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | '3months' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        setAnalyticsData(await analyticsApi.get(period));
      } catch {}
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [period]);

  const topicRows = Object.entries(analyticsData?.topicBreakdown || {})
    .map(([topic, bucket]: any) => {
      const solved = bucket.solved || 0;
      const easy = bucket.easy || 0;
      const medium = bucket.medium || 0;
      const hard = bucket.hard || 0;
      const mastery = solved === 0 ? 0 : Math.min(100, Math.round(((easy * 100) + (medium * 70) + (hard * 40)) / solved));
      return { topic, solved, accuracy: mastery, mastery };
    })
    .sort((a: any, b: any) => a.mastery - b.mastery);

  const weakTopics = topicRows.slice(0, 4);
  const strongTopics = [...topicRows].sort((a, b) => b.mastery - a.mastery).slice(0, 4);

  const monthlyData = (analyticsData?.monthlyData || []).map((entry: any) => ({
    month: entry.month,
    easy: entry.easy || 0,
    medium: entry.medium || 0,
    hard: entry.hard || 0,
  }));

  const radarData = topicRows.slice(0, 8).map((entry: any) => ({
    topic: entry.topic,
    mastery: entry.mastery,
  }));

  const speedData = ['Easy', 'Medium', 'Hard'].map(difficulty => ({
    difficulty,
    avg: analyticsData?.speedAnalysis?.[difficulty]?.avg || 0,
    count: analyticsData?.speedAnalysis?.[difficulty]?.count || 0,
  }));

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : 365;
  const activeDays = analyticsData?.activityData?.length || 0;
  const consistencyScore = periodDays ? Math.min(100, Math.round((activeDays / periodDays) * 100)) : 0;
  const totalSolved = analyticsData?.totalSolved || 0;
  const avgDailyProblems = periodDays ? (totalSolved / periodDays).toFixed(1) : '0.0';
  const bestStreak = analyticsData?.userStats?.maxStreak || 0;
  const totalTimeHours = Math.round((Object.values(analyticsData?.speedAnalysis || {}).reduce((sum: number, item: any) => sum + (item.avg || 0) * (item.count || 0), 0) / 60));

  const platformData = [
    { platform: 'LeetCode', solved: analyticsData?.leetcode?.solved || 0, color: '#ffa116' },
    { platform: 'Codeforces', solved: analyticsData?.codeforces?.solved || 0, color: '#1e69d2' },
    { platform: 'CodeChef', solved: analyticsData?.codechef?.solved || 0, color: '#5b4638' },
    { platform: 'GFG', solved: analyticsData?.gfg?.solved || 0, color: '#2cae4d' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
          <p className="text-gray-500 text-sm">Deep dive into your DSA performance</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['week','month','3months','year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${period === p ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {p === '3months' ? '3 Months' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Consistency Score', value: `${consistencyScore}%`, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', change: `${activeDays} active days`, trend: 'up' },
          { label: 'Avg Daily Problems', value: avgDailyProblems, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: `${totalSolved} solved total`, trend: 'up' },
          { label: 'Best Streak', value: `${bestStreak} days`, icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', change: 'From profile history', trend: 'neutral' },
          { label: 'Total Time', value: `${totalTimeHours}h`, icon: Clock, color: 'text-pink-400', bg: 'bg-pink-500/10', change: 'Based on submissions', trend: 'up' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-xs ${stat.trend === 'up' ? 'text-emerald-400' : 'text-gray-500'}`}>{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Problems by difficulty over time */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Problems Solved by Difficulty</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            <Bar dataKey="easy" name="Easy" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="hard" name="Hard" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar - topic mastery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Topic Mastery Map</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name="Mastery" dataKey="mastery" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Speed analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Solving Speed (minutes)</h3>
          <div className="space-y-4 mt-2">
            {speedData.map(s => (
              <div key={s.difficulty}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${s.difficulty === 'Easy' ? 'text-emerald-400' : s.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.difficulty}
                  </span>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>Avg: <span className="text-white">{s.avg}m</span></span>
                    <span>Solved: <span className="text-indigo-400">{s.count}</span></span>
                  </div>
                </div>
                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute h-full rounded-full bg-white/10" style={{ width: `${Math.min(100, s.count * 12)}%` }} />
                  <div className="absolute h-full w-1 rounded-full bg-white" style={{ left: `${Math.min(100, s.avg)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">Based on live submission timings from your stored history</p>
        </motion.div>
      </div>

      {/* Weak & Strong topics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-semibold text-sm">Weak Topics — Needs Practice</h3>
          </div>
          <div className="space-y-3">
            {weakTopics.map((t, i) => (
              <div key={t.topic} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{t.topic}</span>
                    <span className="text-xs text-amber-400">{t.accuracy}% acc</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full" style={{ width: `${t.accuracy}%`, background: `linear-gradient(90deg, #f59e0b, #ef4444)` }} />
                  </div>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0">Practice →</button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Strong Topics — Keep it up!</h3>
          </div>
          <div className="space-y-3">
            {strongTopics.map((t, i) => (
              <div key={t.topic} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{t.topic}</span>
                    <span className="text-xs text-emerald-400">{t.accuracy}% acc</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full" style={{ width: `${t.accuracy}%`, background: `linear-gradient(90deg, #10b981, #06b6d4)` }} />
                  </div>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{t.solved} solved</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Platform breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Platform Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platformData.map(p => (
            <div key={p.platform} className="text-center p-4 bg-white/3 rounded-xl border border-white/5">
              <div className="text-3xl font-bold mb-1" style={{ color: p.color }}>{p.solved}</div>
              <div className="text-sm text-gray-400">{p.platform}</div>
              <div className="text-xs text-gray-600 mt-1">problems solved</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
