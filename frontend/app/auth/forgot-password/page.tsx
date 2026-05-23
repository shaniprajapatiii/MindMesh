'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSent(true); toast.success('Reset code sent!'); }
      else toast.error('Failed. Try again.');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm mx-4">
        <Link href="/auth/login" className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Back to login
        </Link>
        <div className="glass-card rounded-2xl p-8 border border-white/8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">MindMesh</span>
          </div>
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">We sent a reset code to <span className="text-white">{email}</span>. Valid for 15 minutes.</p>
              <Link href="/auth/login" className="btn btn-primary w-full">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot password?</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send a reset code.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
