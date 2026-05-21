'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Users, Search, Filter } from 'lucide-react';

type Scope = 'global' | 'college' | 'friends' | 'weekly';

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('global');
  const [period, setPeriod] = useState<'alltime' | 'weekly' | 'monthly'>('alltime');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?scope=${scope}&period=${period}&search=${search}`)
      .then(r => r.json())
      .then(d => { setData(d.rankings || []); setMyRank(d.myRank || null); })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [scope, period, search]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-5 text-center">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-display font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-500 text-sm">Compete with coders around the world</p>
      </motion.div>

      {/* My rank card */}
      {myRank && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 mb-6 border border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">#{myRank.rank}</div>
              <div>
                <div className="text-white font-semibold">Your Ranking</div>
                <div className="text-xs text-gray-500">{myRank.totalSolved} problems · {myRank.streak} day streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-indigo-400 text-sm font-medium">Top {myRank.percentile}%</div>
              <div className="text-xs text-gray-500">{myRank.pointsToNext} pts to next rank</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['global','college','friends','weekly'] as Scope[]).map(s => (
            <button key={s} onClick={() => setScope(s)} className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${scope === s ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['alltime','monthly','weekly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${period === p ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-8 text-sm py-2" />
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && data.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[data[1], data[0], data[2]].map((user, i) => {
            const ranks = [2, 1, 3];
            const heights = ['h-28', 'h-36', 'h-24'];
            const colors = ['from-gray-400/20 to-gray-500/10 border-gray-400/30', 'from-yellow-400/20 to-amber-500/10 border-yellow-400/30', 'from-amber-600/20 to-orange-500/10 border-amber-600/30'];
            const crowns = ['🥈', '🥇', '🥉'];
            return (
              <motion.div key={user?.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`flex flex-col items-center gap-2 ${i === 1 ? 'order-2' : i === 0 ? 'order-1' : 'order-3'}`}>
                <div className="text-2xl">{crowns[i]}</div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white">
                  {user?.name?.[0] || '?'}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white">{user?.name || '—'}</div>
                  <div className="text-[10px] text-gray-500">{user?.totalSolved || 0} solved</div>
                </div>
                <div className={`${heights[i]} w-20 rounded-t-xl bg-gradient-to-t ${colors[i]} border flex items-start justify-center pt-2`}>
                  <span className="text-lg font-bold text-white">#{ranks[i]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rankings table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 w-12">Rank</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">User</th>
              <th className="text-right text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Solved</th>
              <th className="text-right text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Streak</th>
              <th className="text-right text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">CF Rating</th>
              <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-white/4">
                  <td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <Users className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                  <p className="text-gray-500 text-sm">No rankings yet</p>
                  <p className="text-gray-600 text-xs mt-1">Start solving problems to appear here!</p>
                </td>
              </tr>
            ) : (
              data.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-white/4 hover:bg-white/2 transition-all ${user.isMe ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">{getRankIcon(user.rank || i + 1)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {user.name}
                          {user.isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">You</span>}
                        </div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm text-white font-medium">{user.totalSolved || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-sm text-orange-400">{user.streak || 0}🔥</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-sm text-blue-400">{user.cfRating || '--'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold gradient-text">{user.score || (user.totalSolved * 10 + (user.streak || 0) * 5)}</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
