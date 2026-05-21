'use client';
import { motion } from 'framer-motion';
import { xpToNextLevel } from '@/lib/utils';

interface XPBarProps { xp: number; level: number; showLabel?: boolean; compact?: boolean; }

export function XPBar({ xp, level, showLabel = true, compact = false }: XPBarProps) {
  const { current, required, progress } = xpToNextLevel(xp);
  if (compact) return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-bold text-indigo-300">Lv.{level}</div>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
      </div>
      <div className="text-[10px] text-gray-500">{current}/{required}</div>
    </div>
  );
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-indigo-300 font-semibold">Level {level}</span>
          <span className="text-gray-500">{current} / {required} XP → Lv.{level + 1}</span>
        </div>
      )}
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
        </motion.div>
      </div>
      <div className="text-[10px] text-gray-600 text-right">{progress}% to next level</div>
    </div>
  );
}
