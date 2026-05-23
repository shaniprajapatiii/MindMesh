'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Edit3, Share2, Download, Globe, Lock, MapPin, Github, Twitter, Linkedin,
  Trophy, Flame, Code2, Star, Award, Target, Camera, Check, X, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const BADGE_DEFS = [
  { id: 'first_solve', icon: '🎯', name: 'First Blood', desc: 'Solved your first problem', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
  { id: 'streak_7', icon: '🔥', name: 'Week Warrior', desc: '7-day streak', color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
  { id: 'streak_30', icon: '⚡', name: 'Month Master', desc: '30-day streak', color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30' },
  { id: 'hundred_solved', icon: '💯', name: 'Century Club', desc: '100 problems solved', color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30' },
  { id: 'hard_5', icon: '💪', name: 'Hard Hitter', desc: 'Solved 5 hard problems', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30' },
  { id: 'dp_master', icon: '🧩', name: 'DP Master', desc: 'Solved 20 DP problems', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
  { id: 'cf_1200', icon: '🏆', name: 'CF Pupil', desc: 'Codeforces Rating ≥ 1200', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  { id: 'graph_king', icon: '🕸', name: 'Graph King', desc: 'Solved 15 graph problems', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30' },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [editForm, setEditForm] = useState<any>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile/me')
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setEditForm(data);
        setIsPublic(data.isPublic ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, isPublic }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        toast.success('Profile updated!');
      }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/u/${profile?.username}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast.success('Profile link copied!');
  };

  const downloadCard = () => {
    // Canvas-based profile card generation
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 800, 400);
    grad.addColorStop(0, '#0a0a0f');
    grad.addColorStop(1, '#111118');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 800, 400, 20);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(99,102,241,0.4)';
    ctx.lineWidth = 2;
    ctx.roundRect(1, 1, 798, 398, 20);
    ctx.stroke();

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui';
    ctx.fillText(profile?.name || 'User', 40, 80);

    // Username
    ctx.fillStyle = '#6366f1';
    ctx.font = '20px system-ui';
    ctx.fillText(`@${profile?.username}`, 40, 115);

    // Stats
    const stats = [
      { label: 'Solved', value: String(profile?.totalSolved || 0) },
      { label: 'Streak', value: `${profile?.streak || 0}🔥` },
      { label: 'CF Rating', value: String(profile?.codeforcesRating || '--') },
    ];
    stats.forEach((s, i) => {
      const x = 40 + i * 200;
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 32px system-ui';
      ctx.fillText(s.value, x, 200);
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px system-ui';
      ctx.fillText(s.label, x, 225);
    });

    // Footer
    ctx.fillStyle = '#374151';
    ctx.font = '14px system-ui';
    ctx.fillText('MindMesh', 40, 370);

    const link = document.createElement('a');
    link.download = 'profile-card.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Profile card downloaded!');
  };

  const stats = [
    { label: 'Problems Solved', value: profile?.totalSolved || 0, icon: Code2, color: 'text-indigo-400' },
    { label: 'Current Streak', value: `${profile?.streak || 0}🔥`, icon: Flame, color: 'text-orange-400' },
    { label: 'CF Rating', value: profile?.codeforcesRating || '--', icon: Trophy, color: 'text-blue-400' },
    { label: 'Global Rank', value: profile?.rank || '--', icon: Star, color: 'text-amber-400' },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-cyan-600/20 relative">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isPublic ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-gray-400 border border-white/10'}`}
            >
              {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPublic ? 'Public' : 'Private'}
            </button>
            <button onClick={copyProfileLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/10 text-gray-300 border border-white/10 hover:bg-white/15 transition-all">
              {copySuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
              {copySuccess ? 'Copied!' : 'Share'}
            </button>
            <button onClick={downloadCard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/10 text-gray-300 border border-white/10 hover:bg-white/15 transition-all">
              <Download className="w-3 h-3" />
              Card
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + name */}
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-[#111118] flex items-center justify-center text-3xl font-bold text-white shadow-glow-sm">
                {profile?.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {/* handle avatar upload */}} />
            </div>
            <div className="flex-1 pb-1">
              {editing ? (
                <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="text-xl font-bold bg-transparent border-b border-indigo-500 text-white outline-none w-full mb-1" />
              ) : (
                <h1 className="text-xl font-bold text-white">{profile?.name || session?.user?.name}</h1>
              )}
              <div className="text-indigo-400 text-sm">@{profile?.username}</div>
            </div>
            <div className="pb-1">
              {editing ? (
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={saving} className="btn btn-primary text-xs px-3 py-1.5 gap-1.5">
                    {saving ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditForm(profile); }} className="btn btn-secondary text-xs px-3 py-1.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="btn btn-secondary text-xs px-3 py-2 gap-1.5">
                  <Edit3 className="w-3 h-3" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {editing ? (
            <textarea
              value={editForm.bio || ''}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell the world about yourself..."
              className="w-full text-sm mb-3 resize-none h-16"
            />
          ) : (
            <p className="text-gray-400 text-sm mb-3">{profile?.bio || 'No bio yet. Click Edit Profile to add one.'}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
            {(editing ? editForm : profile)?.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(editing ? editForm : profile).location}</span>
            )}
            {editing && (
              <input value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" className="text-xs py-1 px-2" />
            )}
          </div>

          {/* Social links */}
          <div className="flex gap-3">
            {[
              { key: 'github', icon: Github, label: 'GitHub', prefix: 'github.com/' },
              { key: 'twitter', icon: Twitter, label: 'Twitter', prefix: 'twitter.com/' },
              { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', prefix: 'linkedin.com/in/' },
            ].map(({ key, icon: Icon, label, prefix }) => (
              editing ? (
                <div key={key} className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                  <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <input value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} placeholder={label} className="text-xs py-1 flex-1" />
                </div>
              ) : profile?.[key] ? (
                <a key={key} href={`https://${prefix}${profile[key]}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />{profile[key]}
                </a>
              ) : null
            ))}
          </div>

          {/* Platform IDs */}
          {editing && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-gray-500 mb-3 font-medium">Connected Platforms</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'leetcodeId', label: 'LeetCode', color: 'text-amber-400' },
                  { key: 'codeforcesId', label: 'Codeforces', color: 'text-blue-400' },
                  { key: 'codechefId', label: 'CodeChef', color: 'text-orange-400' },
                  { key: 'gfgId', label: 'GeeksforGeeks', color: 'text-green-400' },
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <label className={`block text-xs mb-1 ${color}`}>{label}</label>
                    <input value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} placeholder={`${label} username`} className="w-full text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Badges</h3>
          <span className="text-xs text-gray-500">{(profile?.badges || []).length}/{BADGE_DEFS.length} earned</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BADGE_DEFS.map(badge => {
            const earned = (profile?.badges || []).includes(badge.id);
            return (
              <div key={badge.id} className={`rounded-xl p-3 border transition-all ${earned ? `bg-gradient-to-br ${badge.color} ${badge.border}` : 'bg-white/3 border-white/5 opacity-40 grayscale'}`}>
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-semibold text-white">{badge.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{badge.desc}</div>
                {!earned && <div className="text-[10px] text-gray-600 mt-1">🔒 Locked</div>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Platform connections */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Platform Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'LeetCode', id: profile?.leetcodeId, icon: '⚡', stats: { solved: profile?.leetcode?.solved || 0, rating: null, easy: profile?.leetcode?.easy || 0, medium: profile?.leetcode?.medium || 0, hard: profile?.leetcode?.hard || 0 }, color: '#ffa116' },
            { name: 'Codeforces', id: profile?.codeforcesId, icon: '🏆', stats: { solved: profile?.codeforces?.solved || 0, rating: profile?.codeforcesRating || null }, color: '#1e69d2' },
            { name: 'CodeChef', id: profile?.codechefId, icon: '👨‍🍳', stats: { solved: profile?.codechef?.solved || 0, rating: profile?.codechef?.rating || null }, color: '#5b4638' },
            { name: 'GeeksforGeeks', id: profile?.gfgId, icon: '🧠', stats: { solved: profile?.gfg?.solved || 0, score: profile?.gfg?.score || 0 }, color: '#2cae4d' },
          ].map((p, i) => (
            <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  {p.id ? <div className="text-xs text-gray-500">@{p.id}</div> : <div className="text-xs text-gray-600">Not connected</div>}
                </div>
              </div>
              {p.id ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold" style={{ color: p.color }}>{p.stats.solved}</div>
                  <div className="text-xs text-gray-500">problems solved</div>
                  {p.stats.rating && <div className="text-xs text-gray-400">Rating: <span className="text-white">{p.stats.rating}</span></div>}
                  {'easy' in p.stats && (
                    <div className="flex gap-2 text-[10px] mt-2">
                      <span className="badge-easy px-1.5 py-0.5 rounded">{(p.stats as any).easy} Easy</span>
                      <span className="badge-medium px-1.5 py-0.5 rounded">{(p.stats as any).medium} Med</span>
                      <span className="badge-hard px-1.5 py-0.5 rounded">{(p.stats as any).hard} Hard</span>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Connect account →</button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
