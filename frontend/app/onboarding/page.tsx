'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', college: '', leetcodeId: '', codeforcesId: '', codechefId: '', gfgId: '' });
  const [loading, setLoading] = useState(false);

  const defaultUsername =
    (session?.user as any)?.username ||
    session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() ||
    '';

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      username: prev.username || defaultUsername,
    }));
  }, [defaultUsername]);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveProfile = async (skipConnections = false) => {
    const username = form.username.trim() || defaultUsername;
    if (!username) {
      toast.error('Choose a username or continue with your existing one');
      return;
    }

    const payload = Object.fromEntries(
      Object.entries({
        username,
        college: form.college || undefined,
        ...(skipConnections
          ? {}
          : {
              leetcodeId: form.leetcodeId || undefined,
              codeforcesId: form.codeforcesId || undefined,
              codechefId: form.codechefId || undefined,
              gfgId: form.gfgId || undefined,
            }),
      }).filter(([, value]) => value !== undefined)
    );

    setLoading(true);
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Profile set up!');
        router.push('/dashboard');
        return;
      }
      toast.error('Setup failed');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card rounded-2xl p-8 border border-white/8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
            <span className="font-display font-bold text-lg text-white">MindMesh</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome, {session?.user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 text-sm mb-6">Set up your public profile and connect platforms later from Settings.</p>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Username (optional)</label>
                <input value={form.username} onChange={update('username')} placeholder={defaultUsername || 'awesome_coder_42'} className="w-full" />
                <p className="text-xs text-gray-600 mt-1">Public profile: /u/{form.username || defaultUsername || 'username'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">College / Company (optional)</label>
                <input value={form.college} onChange={update('college')} placeholder="IIT Delhi" className="w-full" />
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary w-full py-3">
                Continue →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-gray-400 text-sm">Add your coding profiles now or connect them later from Settings.</p>
              {[
                { key: 'leetcodeId', label: 'LeetCode', color: 'text-amber-400', placeholder: 'username' },
                { key: 'codeforcesId', label: 'Codeforces', color: 'text-blue-400', placeholder: 'handle' },
                { key: 'codechefId', label: 'CodeChef', color: 'text-orange-400', placeholder: 'username' },
                { key: 'gfgId', label: 'GeeksforGeeks', color: 'text-green-400', placeholder: 'username' },
              ].map(f => (
                <div key={f.key}>
                  <label className={`block text-xs mb-1.5 ${f.color}`}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={update(f.key)} placeholder={f.placeholder} className="w-full" />
                </div>
              ))}
              <button onClick={() => saveProfile(false)} disabled={loading} className="btn btn-primary w-full py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '🚀 Start Tracking!'}
              </button>
              <button onClick={() => saveProfile(true)} className="btn btn-ghost w-full text-sm text-gray-500">
                Skip for now
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
