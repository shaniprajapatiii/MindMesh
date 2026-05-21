'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center z-50 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow animate-pulse">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <p className="text-gray-500 text-sm">Loading MindMesh...</p>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-white/5 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}
