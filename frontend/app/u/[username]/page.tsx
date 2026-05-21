'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Github, Twitter, Linkedin, Trophy, Flame, Code2, Star, Globe, Lock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const BADGE_DEFS: Record<string, { icon: string; name: string; color: string }> = {
  first_solve: { icon: '🎯', name: 'First Blood', color: 'from-emerald-500/20 to-teal-500/20' },
  streak_7: { icon: '🔥', name: 'Week Warrior', color: 'from-orange-500/20 to-red-500/20' },
  streak_30: { icon: '⚡', name: 'Month Master', color: 'from-yellow-500/20 to-amber-500/20' },
  hundred_solved: { icon: '💯', name: 'Century Club', color: 'from-indigo-500/20 to-violet-500/20' },
  hard_5: { icon: '💪', name: 'Hard Hitter', color: 'from-red-500/20 to-rose-500/20' },
  dp_master: { icon: '🧩', name: 'DP Master', color: 'from-pink-500/20 to-rose-500/20' },
  cf_1200: { icon: '🏆', name: 'CF Pupil', color: 'from-blue-500/20 to-cyan-500/20' },
  graph_king: { icon: '🕸', name: 'Graph King', color: 'from-purple-500/20 to-violet-500/20' },
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/profile/${username}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 403 ? 'private' : 'not_found');
        return r.json();
      })
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error === 'private') return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <Lock className="w-12 h-12 text-gray-600" />
      <h2 className="text-white font-bold text-xl">Profile is Private</h2>
      <p className="text-gray-500 text-sm">This user has set their profile to private.</p>
      <Link href="/" className="btn btn-secondary text-sm">← Back to Home</Link>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <Code2 className="w-12 h-12 text-gray-600" />
      <h2 className="text-white font-bold text-xl">User Not Found</h2>
      <Link href="/" className="btn btn-secondary text-sm">← Back to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="grid-bg fixed inset-0 opacity-20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 h-14 flex items-center justify-between relative z-10">
        <Link href="/" className="font-display font-bold text-white text-lg">DSATracker</Link>
        <div className="flex gap-2">
          <Link href="/auth/login" className="btn btn-ghost text-sm px-3 py-1.5">Sign in</Link>
          <Link href="/auth/register" className="btn btn-primary text-sm px-3 py-1.5">Join Free</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 relative z-10 space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="h-28 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-cyan-600/20 relative">
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-[#111118] flex items-center justify-center text-3xl font-bold text-white shadow-glow-sm flex-shrink-0">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="pb-1 flex-1">
                <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                <div className="text-indigo-400 text-sm">@{profile.username}</div>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Globe className="w-3 h-3" /> Public Profile
                </div>
              </div>
            </div>

            {profile.bio && <p className="text-gray-400 text-sm mb-3">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
              {profile.college && <span className="flex items-center gap-1">🎓 {profile.college}</span>}
              <span className="flex items-center gap-1">📅 Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>

            {(profile.github || profile.twitter || profile.linkedin) && (
              <div className="flex gap-3 mt-3">
                {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Github className="w-3.5 h-3.5" />{profile.github}</a>}
                {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Twitter className="w-3.5 h-3.5" />{profile.twitter}</a>}
                {profile.linkedin && <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Linkedin className="w-3.5 h-3.5" />{profile.linkedin}</a>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Problems Solved', value: profile.totalSolved || 0, icon: Code2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Current Streak', value: `${profile.streak || 0}🔥`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'CF Rating', value: profile.cfRating || '--', icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Max Streak', value: `${profile.maxStreak || 0}⚡`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card rounded-xl p-4 text-center">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
              </div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Badges ({profile.badges.length})</h3>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((badgeId: string) => {
                const badge = BADGE_DEFS[badgeId];
                if (!badge) return null;
                return (
                  <div key={badgeId} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br ${badge.color} border border-white/10`}>
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-xs font-medium text-white">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Platform stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Platform Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'LeetCode', value: profile.leetcodeSolved || 0, label: 'solved', color: '#ffa116', icon: '⚡' },
              { name: 'Codeforces', value: profile.cfRating || '--', label: 'rating', color: '#1e69d2', icon: '🏆' },
              { name: 'CodeChef', value: profile.codechefRating || '--', label: 'rating', color: '#5b4638', icon: '👨‍🍳' },
              { name: 'GFG', value: profile.gfgSolved || 0, label: 'solved', color: '#2cae4d', icon: '🧠' },
            ].map((p, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="text-xl font-bold" style={{ color: p.color }}>{p.value}</div>
                <div className="text-xs text-gray-400">{p.name}</div>
                <div className="text-[10px] text-gray-600">{p.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 text-center border border-indigo-500/20 bg-indigo-500/5">
          <p className="text-gray-400 text-sm mb-4">Want to track your own DSA progress?</p>
          <Link href="/auth/register">
            <button className="btn btn-primary px-8 py-2.5">Join DSATracker Free →</button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
