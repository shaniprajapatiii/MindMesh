'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, BadgeCheck, Activity, ServerCog, RefreshCcw, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.overview());
    } catch (e: any) {
      setError(e.message || 'Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="glass-card rounded-2xl p-8 border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h1 className="text-white text-xl font-bold">Admin Access Required</h1>
              <p className="text-gray-400 text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs mb-3">
            <Shield className="w-3.5 h-3.5" /> Admin console
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            Live operational overview for user growth, platform connections, content volume, and recent platform activity.
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary gap-2">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      {loading || !data ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Users', value: data.totals.users, icon: Users, color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
              { label: 'Submissions', value: data.totals.submissions, icon: FileText, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
              { label: 'Notes', value: data.totals.notes, icon: BadgeCheck, color: 'text-amber-300', bg: 'bg-amber-500/10' },
              { label: 'Activity logs', value: data.totals.activities, icon: Activity, color: 'text-sky-300', bg: 'bg-sky-500/10' },
            ].map(card => (
              <div key={card.label} className="glass-card rounded-2xl p-5 border border-white/8">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid xl:grid-cols-[0.7fr_1.3fr] gap-5 items-start">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ServerCog className="w-4 h-4 text-violet-400" /> Platform connections
              </div>
              {Object.entries(data.platformHealth).map(([name, value]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400 capitalize">{name}</span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (Number(value) / Math.max(data.totals.users, 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold">Recent users</h2>
                  <p className="text-xs text-gray-500 mt-1">Newest accounts and their connection state</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Connected</th>
                      <th className="px-4 py-3">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.map((user: any) => {
                      const connectedCount = [user.leetcodeId, user.codeforcesId, user.codechefId, user.gfgId].filter(Boolean).length;
                      return (
                        <tr key={user.id} className="border-b border-white/4">
                          <td className="px-4 py-3">
                            <div className="text-sm text-white font-medium">{user.name || user.email}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 capitalize">{user.role || 'user'}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{connectedCount} platforms</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleString() : 'Never'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-2">Why it exists</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Admin visibility keeps the product maintainable by showing real usage, live content volume, and whether platform sync is actually happening.
            </p>
          </div>
        </>
      )}
    </div>
  );
}