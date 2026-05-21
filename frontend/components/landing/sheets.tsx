'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SHEETS = [
  { name: "Striver's A-Z Sheet", problems: 455, color: 'from-indigo-500 to-violet-500', level: 'Comprehensive' },
  { name: 'Love Babbar 450', problems: 450, color: 'from-blue-500 to-cyan-500', level: 'Structured' },
  { name: 'Blind 75', problems: 75, color: 'from-emerald-500 to-teal-500', level: 'Interview Prep' },
  { name: 'NeetCode 150', problems: 150, color: 'from-amber-500 to-orange-500', level: 'Curated' },
  { name: 'Fraz Sheet', problems: 300, color: 'from-pink-500 to-rose-500', level: 'Topic-wise' },
  { name: 'Custom Sheet', problems: 0, color: 'from-violet-500 to-purple-500', level: 'Build Your Own' },
];

export function SheetsSection() {
  return (
    <section id="sheets" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Popular <span className="gradient-text">DSA Sheets</span></h2>
          <p className="text-gray-400">All curated sheets in one place. Track completion. Never lose progress.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHEETS.map((sheet, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${sheet.color} mb-4`} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{sheet.name}</h3>
                  <span className="text-xs text-gray-500">{sheet.level}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{sheet.problems || '∞'} problems</span>
              </div>
              <div className="progress-bar mt-3">
                <div className={`h-full rounded-full bg-gradient-to-r ${sheet.color}`} style={{ width: '0%' }} />
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
