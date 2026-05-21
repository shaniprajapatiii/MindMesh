'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  TrendingUp, Flame, Code2, BookOpen, Target, Zap, ArrowRight,
  CheckCircle, Clock, AlertCircle, BarChart2, Activity
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi, dashboardApi } from '@/lib/api';
import RevisionPanel from '@/components/dashboard/RevisionPanel';

// Heatmap component
function ActivityHeatmap({ data }: { data: Record<string, number> }) {
  const today = new Date();
  const weeks = 26;
  const cells = [];
  
  for (let w = weeks - 1; w >= 0; w--) {
    const weekCells = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().split('T')[0];
      const count = data[dateStr] || 0;
      const intensity = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 6 ? 3 : 4;
      weekCells.push({ date: dateStr, count, intensity });
    }
    cells.push(weekCells);
  }

  const colors = ['rgba(255,255,255,0.04)', 'rgba(99,102,241,0.3)', 'rgba(99,102,241,0.5)', 'rgba(99,102,241,0.7)', 'rgba(99,102,241,0.9)'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={di}
                className="w-3 h-3 rounded-sm heatmap-cell cursor-pointer"
                style={{ background: colors[cell.intensity] }}
                data-tooltip={`${cell.date}: ${cell.count} problems`}
                title={`${cell.date}: ${cell.count} solved`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSolved: 0, streak: 0, rating: 0, rank: '--',
    easy: 0, medium: 0, hard: 0,
    leetcode: { solved: 0, total: 3372 },
    codeforces: { rating: 0, maxRating: 0 },
    codechef: { rating: 0, stars: 0 },
    gfg: { solved: 0, score: 0 },
  });
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [recentProblems, setRecentProblems] = useState<any[]>([]);
  const [solvedOverTime, setSolvedOverTime] = useState<any[]>([]);
  const [topicData, setTopicData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityMap, recentList, analyticsPayload] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.activity(),
          dashboardApi.recentProblems(),
          analyticsApi.get('month'),
        ]);
        setStats(statsData);
        setActivityData(activityMap);
        setRecentProblems(recentList);
        setAnalyticsData(analyticsPayload);

        setSolvedOverTime((analyticsPayload?.monthlyData || []).map((entry: any) => ({
          month: entry.month,
          problems: (entry.easy || 0) + (entry.medium || 0) + (entry.hard || 0),
        })));

        const topicPalette = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];
        setTopicData(
          Object.entries(analyticsPayload?.topicBreakdown || {})
            .map(([name, value]: any, index) => ({ name, value: value.solved || 0, color: topicPalette[index % topicPalette.length] }))
            .filter((entry: any) => entry.value > 0)
            .sort((a: any, b: any) => b.value - a.value),
        );
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickStats = [
    { label: 'Total Solved', value: stats.totalSolved || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', change: '+12 this week' },
    { label: 'Current Streak', value: `${stats.streak || 0}🔥`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', change: 'Keep it up!' },
    { label: 'CF Rating', value: stats.codeforces?.rating || '--', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', change: 'Specialist' },
    { label: 'Problems Today', value: 0, icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', change: 'Goal: 3/day' },
  ];

  const platforms = [
    { name: 'LeetCode', solved: stats.leetcode?.solved || 0, total: 3372, color: '#ffa116', icon: '⚡' },
    { name: 'Codeforces', solved: stats.codeforces?.rating || 0, total: null, label: 'Rating', color: '#1e69d2', icon: '🏆' },
    { name: 'CodeChef', solved: stats.codechef?.rating || 0, total: null, label: 'Rating', color: '#5b4638', icon: '👨‍🍳' },
    { name: 'GeeksforGeeks', solved: stats.gfg?.solved || 0, total: null, label: 'Score', color: '#2cae4d', icon: '🧠' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">
            Welcome back, <span className="gradient-text">{session?.user?.name?.split(' ')[0] || 'Coder'}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm">Here's your DSA progress overview</p>
        </div>
        <Link href="/problems">
          <button className="btn btn-primary text-sm px-4 py-2">
            <Code2 className="w-4 h-4" />
            Solve a Problem
          </button>
        </Link>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl p-4 border ${stat.border}`}
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-xs ${stat.color} font-medium`}>{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm mb-0.5">Activity Heatmap</h3>
              <p className="text-gray-500 text-xs">{Object.values(activityData).reduce((a, b) => a + b, 0)} problems solved this year</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>Less</span>
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: ['rgba(255,255,255,0.04)','rgba(99,102,241,0.3)','rgba(99,102,241,0.5)','rgba(99,102,241,0.7)','rgba(99,102,241,0.9)'][i] }} />
              ))}
              <span>More</span>
            </div>
          </div>
          {loading ? (
            <div className="h-24 skeleton rounded-lg" />
          ) : (
            <ActivityHeatmap data={activityData} />
          )}
        </motion.div>

        {/* Topic distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Topic Distribution</h3>
          <div className="flex justify-center mb-3">
            <PieChart width={160} height={160}>
              <Pie data={topicData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {topicData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </div>
          <div className="space-y-2">
            {topicData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
                <span className="text-xs text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Platform stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Platform Stats</h3>
          <Link href="/settings" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Connect more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((p, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-medium text-white">{p.name}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1" style={{ color: p.color }}>
                {p.solved || '--'}
              </div>
              <div className="text-xs text-gray-500">
                {p.total ? `/ ${p.total} problems` : p.label}
              </div>
              {p.total && p.solved ? (
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: `${Math.min((p.solved / p.total) * 100, 100)}%`, background: p.color }} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Progress chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 glass-card rounded-xl p-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Problems Solved Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={solvedOverTime}>
              <defs>
                <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="problems" stroke="#6366f1" strokeWidth={2} fill="url(#colorProblems)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Problems</h3>
            <Link href="/problems" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentProblems.length === 0 ? (
              <div className="text-center py-8">
                <Code2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No problems yet</p>
                <Link href="/problems">
                  <button className="btn btn-primary text-xs px-3 py-1.5 mt-3">Start Solving</button>
                </Link>
              </div>
            ) : (
              recentProblems.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/4 transition-all cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    p.status === 'solved' ? 'bg-emerald-400' : p.status === 'attempted' ? 'bg-amber-400' : 'bg-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-gray-600">{p.platform} • {p.timeAgo}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                  }`}>
                    {p.difficulty}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
        {/* Revision queue panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5"
        >
          <RevisionPanel />
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { href: '/ai-mentor', icon: '🧠', title: 'Ask AI Mentor', desc: 'Get hints & explanations', color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20' },
          { href: '/canvas', icon: '🎨', title: 'Draw DS', desc: 'Visualize data structures', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
          { href: '/notes', icon: '📝', title: 'My Notes', desc: 'Review your notes', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
          { href: '/sheets', icon: '📋', title: 'DSA Sheets', desc: 'Continue sheet progress', color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20' },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <div className={`glass-card rounded-xl p-4 bg-gradient-to-br ${action.color} border hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold text-white">{action.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
