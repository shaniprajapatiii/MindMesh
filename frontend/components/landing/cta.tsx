'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const PERKS = ['Free forever plan', 'AI-powered notes', 'All DSA sheets included', 'No credit card required'];

export function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card rounded-3xl p-12 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">
              Ready to become a <span className="gradient-text">DSA beast?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students who cracked FAANG with MindMesh. Start your journey today — completely free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {PERKS.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />{perk}
                </div>
              ))}
            </div>
            <Link href="/auth/register">
              <button className="btn btn-primary px-10 py-4 text-base shadow-glow hover:shadow-glow-lg">
                Get Started — It's Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
