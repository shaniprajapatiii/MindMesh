'use client';
import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Trophy, Flame, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/hooks';

interface Notification {
  id: string;
  type: 'badge' | 'streak' | 'ai' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const ICONS = { badge: Trophy, streak: Flame, ai: Brain, system: CheckCircle };
const COLORS = { badge: 'text-amber-400', streak: 'text-orange-400', ai: 'text-violet-400', system: 'text-indigo-400' };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Mock notifications — replace with real API call
    setNotifications([
      { id: '1', type: 'streak', title: 'Streak milestone!', message: 'You hit a 7-day streak 🔥', read: false, createdAt: new Date().toISOString() },
      { id: '2', type: 'ai', title: 'AI Notes Ready', message: 'Notes for "Two Sum" are generated', read: false, createdAt: new Date().toISOString() },
      { id: '3', type: 'badge', title: 'Badge Earned', message: 'You earned "First Blood" badge 🎯', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
  }, []);

  const markAll = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id: string) => setNotifications(n => n.filter(x => x.id !== id));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a26] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unread > 0 && <button onClick={markAll} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-600 text-sm">No notifications</div>
              ) : (
                notifications.map(n => {
                  const Icon = ICONS[n.type];
                  return (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/4 last:border-0 transition-all hover:bg-white/3 ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${COLORS[n.type]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="p-1 text-gray-600 hover:text-gray-400 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
