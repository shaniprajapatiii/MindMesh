'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { value: '50K+', label: 'Problems Tracked', suffix: '' },
    { value: '10K+', label: 'Active Students', suffix: '' },
    { value: '500K+', label: 'Notes Generated', suffix: '' },
    { value: '98%', label: 'User Satisfaction', suffix: '' },
  ];
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-display font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SheetsSection() {
  const sheets = [
    { name: "Striver's A-Z Sheet", problems: 455, completion: 0, color: 'from-indigo-500 to-violet-500', level: 'Comprehensive' },
    { name: 'Love Babbar Sheet', problems: 450, completion: 0, color: 'from-blue-500 to-cyan-500', level: 'Structured' },
    { name: 'Blind 75', problems: 75, completion: 0, color: 'from-emerald-500 to-teal-500', level: 'Interview Prep' },
    { name: 'NeetCode 150', problems: 150, completion: 0, color: 'from-amber-500 to-orange-500', level: 'Curated' },
    { name: 'Fraz Sheet', problems: 300, completion: 0, color: 'from-pink-500 to-rose-500', level: 'Topic-wise' },
    { name: 'Custom Sheet', problems: 0, completion: 0, color: 'from-violet-500 to-purple-500', level: 'Build Your Own' },
  ];
  return (
    <section id="sheets" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Popular <span className="gradient-text">DSA Sheets</span></h2>
          <p className="text-gray-400">All curated sheets in one place. Track completion. Never lose progress.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sheets.map((sheet, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${sheet.color} mb-4`} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{sheet.name}</h3>
                  <span className="text-xs text-gray-500">{sheet.level}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{sheet.problems || '∞'} problems</span>
              </div>
              <div className="progress-bar mt-3">
                <div className={`progress-fill bg-gradient-to-r ${sheet.color}`} style={{ width: '0%' }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">0 / {sheet.problems || '—'}</span>
                <span className="text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">Start →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const perks = ['Free forever plan', 'AI-powered notes', 'All DSA sheets included', 'No credit card required'];
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-3xl p-12 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Ready to become a{' '}
              <span className="gradient-text">DSA beast?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students who cracked FAANG with DSATracker. Start your journey today — completely free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {perk}
                </div>
              ))}
            </div>
            <Link href="/auth/register">
              <button className="btn btn-primary px-10 py-4 text-base shadow-glow hover:shadow-glow-lg">
                Get Started — It's Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-white font-display font-bold text-lg mb-3">DSATracker</div>
            <p className="text-gray-500 text-sm leading-relaxed">The ultimate competitive programming companion for students targeting top tech companies.</p>
          </div>
          {[
            { title: 'Platform', links: ['Problems', 'Sheets', 'Leaderboard', 'Community'] },
            { title: 'Tools', links: ['Code Editor', 'Canvas Visualizer', 'AI Notes', 'Analytics'] },
            { title: 'Company', links: ['About', 'Blog', 'Privacy', 'Terms'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="text-white font-semibold text-sm mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}><a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 DSATracker. Built with ❤️ for students.</p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'Discord', 'LinkedIn'].map((social) => (
              <a key={social} href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
