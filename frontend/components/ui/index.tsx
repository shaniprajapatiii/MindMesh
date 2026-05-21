'use client';
import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// ── Button ────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:brightness-110 hover:-translate-y-0.5 shadow-glow-sm hover:shadow-glow active:translate-y-0',
      secondary: 'bg-white/6 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20',
      ghost: 'text-gray-400 hover:text-white hover:bg-white/6',
      danger: 'bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
    return (
      <button ref={ref} disabled={disabled || loading} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ── Badge ─────────────────────────────────────────────────────────────
interface BadgeProps { children: ReactNode; variant?: 'easy' | 'medium' | 'hard' | 'info' | 'ai' | 'new'; className?: string; }

export function Badge({ children, variant = 'info', className }: BadgeProps) {
  const variants = {
    easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    hard: 'bg-red-500/15 text-red-300 border-red-500/30',
    info: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    ai: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    new: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
  return <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border', variants[variant], className)}>{children}</span>;
}

// ── Card ──────────────────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; }

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div onClick={onClick} className={clsx('bg-[#1a1a26] border border-white/8 rounded-xl transition-all duration-200', hover && 'hover:bg-[#1e1e2d] hover:border-white/12 hover:-translate-y-0.5 cursor-pointer', onClick && 'cursor-pointer', className)}>
      {children}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={clsx('animate-spin text-indigo-400', sizes[size], className)} />;
}

// ── Modal ─────────────────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: string; }

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={clsx('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full mx-4 bg-[#1a1a26] border border-white/10 rounded-2xl shadow-2xl', maxWidth)}>
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <h3 className="text-white font-semibold">{title}</h3>
                <button onClick={onClose} className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/8 transition-all"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Input ─────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: ReactNode; }

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-medium text-gray-400">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
      <input ref={ref} className={clsx('w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5', icon && 'pl-9', error && 'border-red-500/50', className)} {...props} />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-white/5 rounded-lg', className)} />;
}

// ── Progress ──────────────────────────────────────────────────────────
export function Progress({ value, max = 100, color = 'indigo', className }: { value: number; max?: number; color?: string; className?: string }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={clsx('h-1.5 bg-white/6 rounded-full overflow-hidden', className)}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color === 'indigo' ? 'from-indigo-500 to-violet-500' : color === 'green' ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'}`} />
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────
export function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1e1e2d] border border-white/10 rounded-lg text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1e2d]" />
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────
export function Toggle({ value, onChange, size = 'md' }: { value: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' } : { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' };
  return (
    <button onClick={() => onChange(!value)} className={clsx('relative rounded-full transition-all duration-200', sz.track, value ? 'bg-indigo-500' : 'bg-white/10')}>
      <span className={clsx('absolute top-0.5 left-0.5 rounded-full bg-white transition-transform duration-200', sz.thumb, value && sz.translate)} />
    </button>
  );
}

// ── Empty State ───────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-gray-600 mb-1">{icon}</div>
      <p className="text-gray-300 font-medium text-sm">{title}</p>
      {description && <p className="text-gray-600 text-xs max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
