'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Code2, Brain, TrendingUp, GitBranch } from 'lucide-react';

const floatingCards = [
  { icon: Code2, label: 'LeetCode', value: '2847 solved', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20', textColor: 'text-amber-400', x: '-left-4', y: 'top-20' },
  { icon: TrendingUp, label: 'Codeforces', value: 'Rating: 1842', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/20', textColor: 'text-blue-400', x: '-right-4', y: 'top-32' },
  { icon: Brain, label: 'AI Notes', value: '124 generated', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20', textColor: 'text-violet-400', x: '-left-8', y: 'bottom-24' },
  { icon: GitBranch, label: 'Streak', value: '47 days 🔥', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20', textColor: 'text-emerald-400', x: '-right-8', y: 'bottom-16' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered DSA Platform
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-display font-bold leading-tight"
          >
            Master{' '}
            <span className="gradient-text">DSA</span>
            {' '}like a{' '}
            <span className="relative">
              <span className="gradient-text">Pro</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="url(#heroLine)" strokeWidth="2.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="heroLine" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400 leading-relaxed max-w-xl"
          >
            Track your progress across LeetCode, Codeforces, CodeChef & GFG. Get AI-generated notes, visualize data structures on canvas, solve problems in our built-in editor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/auth/register">
              <button className="btn btn-primary px-8 py-3.5 text-base shadow-glow hover:shadow-glow-lg transition-all duration-300">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="btn btn-secondary px-8 py-3.5 text-base group">
              <Play className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 pt-4"
          >
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-500"><span className="text-white font-medium">10k+</span> students trust us</p>
            </div>
          </motion.div>
        </div>

        {/* Right content - animated mockup */}
        <div className="relative hidden lg:block h-[600px]">
          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[460px] glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/8">
              {/* Card header */}
              <div className="bg-[#111118] px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-gray-500 text-xs ml-2">Two Sum — Easy</span>
                </div>
                <span className="text-xs badge-easy px-2 py-0.5 rounded-full">Easy</span>
              </div>
              {/* Code preview */}
              <div className="p-5 font-mono text-sm leading-relaxed">
                <div className="text-gray-500 text-xs mb-3">// Optimal Solution — O(n)</div>
                <div><span className="text-violet-400">function</span> <span className="text-blue-400">twoSum</span><span className="text-gray-300">(nums, target) {'{'}</span></div>
                <div className="pl-4"><span className="text-violet-400">const</span> <span className="text-cyan-400">map</span> <span className="text-gray-300">= </span><span className="text-violet-400">new</span> <span className="text-yellow-300">Map</span><span className="text-gray-300">();</span></div>
                <div className="pl-4"><span className="text-violet-400">for</span> <span className="text-gray-300">(</span><span className="text-violet-400">let</span> <span className="text-cyan-400">i</span> <span className="text-gray-300">= 0; i &lt; nums.length; i++) {'{'}</span></div>
                <div className="pl-8"><span className="text-violet-400">const</span> <span className="text-cyan-400">comp</span> <span className="text-gray-300">= target - nums[i];</span></div>
                <div className="pl-8"><span className="text-violet-400">if</span> <span className="text-gray-300">(map.has(comp))</span></div>
                <div className="pl-12"><span className="text-violet-400">return</span> <span className="text-gray-300">[map.get(comp), i];</span></div>
                <div className="pl-8"><span className="text-cyan-400">map</span><span className="text-gray-300">.set(nums[i], i);</span></div>
                <div className="pl-4"><span className="text-gray-300">{'}'}</span></div>
                <div><span className="text-gray-300">{'}'}</span></div>
              </div>
              {/* Result */}
              <div className="mx-5 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-medium">Accepted</span>
                </div>
                <div className="text-xs text-gray-500">Runtime: 64ms • Memory: 44.2MB</div>
              </div>
            </div>
          </motion.div>

          {/* Floating cards */}
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              className={`absolute ${card.x} ${card.y} w-44`}
              style={{ animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }}
            >
              <div className={`glass-card rounded-xl p-3 bg-gradient-to-br ${card.color} border ${card.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={`w-4 h-4 ${card.textColor}`} />
                  <span className="text-xs text-gray-400">{card.label}</span>
                </div>
                <div className={`text-sm font-semibold ${card.textColor}`}>{card.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
