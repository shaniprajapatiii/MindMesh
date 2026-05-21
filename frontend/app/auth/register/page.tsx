'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AtSign, Eye, EyeOff, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '',
    leetcodeId: '', codeforcesId: '', codechefId: '', gfgId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const sendOTP = async () => {
    if (!form.email) return toast.error('Enter email first');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      if (res.ok) { setOtpSent(true); setStep(2); toast.success('OTP sent!'); }
      else toast.error('Failed to send OTP');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter complete OTP');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      if (res.ok) { setStep(3); toast.success('Email verified!'); }
      else toast.error('Invalid OTP');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Account created!');
        await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        router.push('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Registration failed');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const otpChange = (i: number, val: string) => {
    if (val.length > 1) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < 5) document.getElementById(`reg-otp-${i+1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden py-12">
      <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Link href="/" className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs ${s === step ? 'text-white' : 'text-gray-600'}`}>
                {s === 1 ? 'Account' : s === 2 ? 'Verify' : 'Platforms'}
              </span>
              {s < 3 && <div className={`flex-1 h-px w-8 ${s < step ? 'bg-emerald-500' : 'bg-white/8'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">DSATracker</span>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h1 className="text-2xl font-bold text-white mb-6">Create your account</h1>
              
              <button onClick={() => signIn('google', { callbackUrl: '/onboarding' })} className="w-full btn btn-secondary py-3 gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={form.name} onChange={update('name')} placeholder="John Doe" className="w-full pl-9 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={form.username} onChange={update('username')} placeholder="johndoe" className="w-full pl-9 text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="w-full pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="••••••••" className="w-full pl-9 pr-9" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" className="w-full pl-9" />
                </div>
              </div>
              <button onClick={sendOTP} disabled={loading} className="btn btn-primary w-full py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Continue → Verify Email'}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Verify your email</h1>
              <p className="text-gray-400 text-sm">Enter the 6-digit code sent to <span className="text-white">{form.email}</span></p>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} id={`reg-otp-${i}`} type="text" maxLength={1} value={d} onChange={(e) => otpChange(i, e.target.value)}
                    className="w-11 h-12 text-center text-xl font-bold" />
                ))}
              </div>
              <button onClick={verifyOTP} disabled={loading} className="btn btn-primary w-full py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Verify OTP'}
              </button>
              <button onClick={sendOTP} className="btn btn-ghost w-full text-sm text-gray-500">Resend code</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h1 className="text-2xl font-bold text-white mb-1">Connect your platforms</h1>
              <p className="text-gray-400 text-sm mb-6">Add your usernames to sync your progress. You can skip and add later.</p>
              {[
                { key: 'leetcodeId', label: 'LeetCode Username', placeholder: 'your_leetcode_id', color: 'text-amber-400' },
                { key: 'codeforcesId', label: 'Codeforces Handle', placeholder: 'your_cf_handle', color: 'text-blue-400' },
                { key: 'codechefId', label: 'CodeChef Username', placeholder: 'your_codechef_id', color: 'text-orange-400' },
                { key: 'gfgId', label: 'GeeksforGeeks Username', placeholder: 'your_gfg_id', color: 'text-green-400' },
              ].map((field) => (
                <div key={field.key}>
                  <label className={`block text-xs mb-1.5 ${field.color}`}>{field.label}</label>
                  <input type="text" value={(form as any)[field.key]} onChange={update(field.key)} placeholder={field.placeholder} className="w-full" />
                </div>
              ))}
              <button onClick={handleRegister} disabled={loading} className="btn btn-primary w-full py-3 mt-4">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '🚀 Create Account & Start Tracking'}
              </button>
              <button onClick={handleRegister} className="btn btn-ghost w-full text-sm text-gray-500">Skip for now</button>
            </motion.div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
