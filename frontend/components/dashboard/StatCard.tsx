'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  change?: string;
  changePositive?: boolean;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, color, bg, border, change, changePositive, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn('bg-[#1a1a26] border rounded-xl p-4 transition-all hover:border-opacity-70', border)}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
        <Icon className={cn('w-[18px] h-[18px]', color)} />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {change && (
        <div className={cn('text-xs font-medium', changePositive !== false ? 'text-emerald-400' : 'text-gray-500')}>
          {change}
        </div>
      )}
    </motion.div>
  );
}

interface PlatformCardProps {
  name: string;
  icon: string;
  value: number | string;
  label: string;
  color: string;
  total?: number;
  connected: boolean;
  onConnect?: () => void;
}

export function PlatformCard({ name, icon, value, label, color, total, connected, onConnect }: PlatformCardProps) {
  return (
    <div className="bg-[#1a1a26] border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-white">{name}</span>
        {connected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      </div>
      {connected ? (
        <>
          <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
          {total && typeof value === 'number' && (
            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((value / total) * 100, 100)}%`, background: color }} />
            </div>
          )}
        </>
      ) : (
        <button onClick={onConnect} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Connect →</button>
      )}
    </div>
  );
}
