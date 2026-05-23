'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { User, Bell, Lock, Globe, Palette, Code2, Trash2, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

type Section = 'account' | 'platforms' | 'notifications' | 'privacy' | 'appearance' | 'danger';

const SECTIONS = [
  { id: 'account', icon: User, label: 'Account' },
  { id: 'platforms', icon: Code2, label: 'Platforms' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'privacy', icon: Globe, label: 'Privacy' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'danger', icon: AlertTriangle, label: 'Danger Zone' },
] as const;

export default function SettingsPage() {
  const { data: session } = useSession();
  const [section, setSection] = useState<Section>('account');
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...settings, ...updates }) });
      if (res.ok) { setSettings((s: any) => ({ ...s, ...updates })); toast.success('Settings saved!'); }
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const syncPlatform = async (platform: string) => {
    setSyncing(platform);
    try {
      const res = await fetch(`/api/platforms/sync/${platform}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) toast.success(`${platform} synced! ${data.solved ?? 0} problems found.`);
      else toast.error(data.message || 'Sync failed');
    } catch { toast.error('Sync failed'); } finally { setSyncing(null); }
  };

  const syncablePlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg'];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setSection(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${section === id ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" style={id === 'danger' ? { color: '#ef4444' } : {}} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {loading ? <div className="skeleton h-64 rounded-xl" /> : (
            <>
              {section === 'account' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-4">
                  <h3 className="text-white font-semibold">Account Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'username', label: 'Username', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'college', label: 'College / Company', type: 'text' }].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs text-gray-400 mb-1.5">{f.label}</label>
                        <input type={f.type} value={settings[f.key] || ''} onChange={e => setSettings((s: any) => ({ ...s, [f.key]: e.target.value }))} className="w-full" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Bio</label>
                    <textarea value={settings.bio || ''} onChange={e => setSettings((s: any) => ({ ...s, bio: e.target.value }))} className="w-full h-20 resize-none" placeholder="Tell us about yourself..." />
                  </div>
                  <button onClick={() => save({})} disabled={saving} className="btn btn-primary text-sm gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </motion.div>
              )}

              {section === 'platforms' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-4">
                  <h3 className="text-white font-semibold">Platform Connections</h3>
                  <p className="text-gray-500 text-sm">Connect your competitive programming accounts to sync your progress automatically. Live sync is available for LeetCode, Codeforces, CodeChef, and GFG.</p>
                  {[
                    { key: 'leetcodeId', label: 'LeetCode', icon: '⚡', color: 'text-amber-400', placeholder: 'your_username', syncable: true },
                    { key: 'codeforcesId', label: 'Codeforces', icon: '🏆', color: 'text-blue-400', placeholder: 'your_handle', syncable: true },
                    { key: 'codechefId', label: 'CodeChef', icon: '👨‍🍳', color: 'text-orange-400', placeholder: 'your_username', syncable: true },
                    { key: 'gfgId', label: 'GeeksforGeeks', icon: '🧠', color: 'text-green-400', placeholder: 'your_username', syncable: true },
                    { key: 'githubId', label: 'GitHub', icon: '🐙', color: 'text-white', placeholder: 'your_username', syncable: false },
                    { key: 'atcoderId', label: 'AtCoder', icon: '🎯', color: 'text-gray-300', placeholder: 'your_username', syncable: false },
                  ].map(p => (
                    <div key={p.key} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                      <span className="text-xl w-8 flex-shrink-0">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <label className={`block text-sm font-medium mb-1 ${p.color}`}>{p.label}</label>
                        <input
                          value={settings[p.key] || ''}
                          onChange={e => setSettings((s: any) => ({ ...s, [p.key]: e.target.value }))}
                          placeholder={p.placeholder}
                          className="w-full text-sm"
                        />
                      </div>
                      {p.syncable ? (
                        <button
                          onClick={() => syncPlatform(p.key.replace('Id', ''))}
                          disabled={!settings[p.key] || syncing === p.key.replace('Id', '')}
                          className="btn btn-secondary text-xs px-3 py-2 gap-1.5 flex-shrink-0 disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncing === p.key.replace('Id', '') ? 'animate-spin' : ''}`} />
                          Sync
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">Saved only</span>
                      )}
                    </div>
                  ))}
                  <button onClick={() => save({})} className="btn btn-primary text-sm gap-2">
                    <Check className="w-4 h-4" /> Save Platform IDs
                  </button>
                </motion.div>
              )}

              {section === 'notifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-5">
                  <h3 className="text-white font-semibold">Notification Preferences</h3>
                  {[
                    { key: 'notif_daily_reminder', label: 'Daily Problem Reminder', desc: 'Get reminded to solve your daily problem' },
                    { key: 'notif_streak_alert', label: 'Streak Alert', desc: 'Alert when your streak is about to break' },
                    { key: 'notif_revision', label: 'Revision Reminders', desc: 'Spaced repetition reminders for weak problems' },
                    { key: 'notif_contest', label: 'Contest Alerts', desc: 'Upcoming Codeforces/LeetCode contests' },
                    { key: 'notif_leaderboard', label: 'Leaderboard Changes', desc: 'When your rank changes' },
                    { key: 'notif_community', label: 'Community Replies', desc: 'Replies to your posts and comments' },
                    { key: 'notif_email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white font-medium">{n.label}</div>
                        <div className="text-xs text-gray-500">{n.desc}</div>
                      </div>
                      <Toggle value={settings[n.key] ?? true} onChange={v => save({ [n.key]: v })} />
                    </div>
                  ))}
                </motion.div>
              )}

              {section === 'privacy' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-5">
                  <h3 className="text-white font-semibold">Privacy Settings</h3>
                  {[
                    { key: 'isPublic', label: 'Public Profile', desc: 'Anyone can view your profile and stats' },
                    { key: 'showStreak', label: 'Show Streak', desc: 'Display your streak on public profile' },
                    { key: 'showSolvedList', label: 'Show Solved Problems', desc: 'Others can see your solved problem list' },
                    { key: 'showOnLeaderboard', label: 'Appear on Leaderboard', desc: 'Show your name in global rankings' },
                    { key: 'allowStudyGroupInvites', label: 'Allow Group Invites', desc: 'Let others invite you to study groups' },
                  ].map(p => (
                    <div key={p.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white font-medium">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.desc}</div>
                      </div>
                      <Toggle value={settings[p.key] ?? true} onChange={v => save({ [p.key]: v })} />
                    </div>
                  ))}
                </motion.div>
              )}

              {section === 'appearance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-5">
                  <h3 className="text-white font-semibold">Appearance</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Editor Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['vs-dark', 'light', 'hc-black', 'monokai', 'dracula', 'github-dark'].map(t => (
                        <button key={t} onClick={() => save({ editorTheme: t })} className={`px-3 py-2 rounded-lg text-xs border transition-all capitalize ${settings.editorTheme === t ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/4 border-white/8 text-gray-400 hover:text-white'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Default Language</label>
                    <select value={settings.defaultLanguage || 'javascript'} onChange={e => save({ defaultLanguage: e.target.value })} className="w-48">
                      {['javascript', 'python', 'java', 'cpp', 'go', 'rust'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Editor Font Size</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="10" max="24" value={settings.fontSize || 14} onChange={e => save({ fontSize: Number(e.target.value) })} className="w-48" />
                      <span className="text-white text-sm w-8">{settings.fontSize || 14}px</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {section === 'danger' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 space-y-4 border border-red-500/20">
                  <h3 className="text-red-400 font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Danger Zone</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Reset Progress', desc: 'Clear all solved problem data. This cannot be undone.', action: 'Reset Progress', color: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' },
                      { label: 'Export Data', desc: 'Download all your data as JSON.', action: 'Export Data', color: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' },
                      { label: 'Delete Account', desc: 'Permanently delete your account and all data.', action: 'Delete Account', color: 'border-red-500/30 text-red-400 hover:bg-red-500/10' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-white/5">
                        <div>
                          <div className="text-sm font-medium text-white">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                        <button className={`text-xs px-4 py-2 rounded-lg border transition-all ${item.color}`}>{item.action}</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
