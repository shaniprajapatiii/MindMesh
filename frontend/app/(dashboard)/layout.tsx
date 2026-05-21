'use client';
import { GlobalSearch } from '@/components/common/GlobalSearch';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Code2, BookOpen, PenTool, BarChart3, Users, Trophy,
  Newspaper, Target, Settings, LogOut, Menu, X, Zap, ChevronRight,
  Brain, GitBranch, Palette, Play, Star, Bell, Search
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', section: 'main' },
  { href: '/problems', icon: Code2, label: 'Problems', section: 'main' },
  { href: '/editor', icon: Play, label: 'Code Editor', section: 'main' },
  { href: '/canvas', icon: Palette, label: 'DS Canvas', section: 'main', badge: 'New' },
  { href: '/notes', icon: BookOpen, label: 'Notes', section: 'learn' },
  { href: '/sheets', icon: Target, label: 'DSA Sheets', section: 'learn' },
  { href: '/roadmap', icon: GitBranch, label: 'Roadmaps', section: 'learn' },
  { href: '/ai-mentor', icon: Brain, label: 'AI Mentor', section: 'ai', badge: 'AI' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', section: 'progress' },
  { href: '/profile', icon: Star, label: 'Profile', section: 'social' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', section: 'social' },
  { href: '/community', icon: Users, label: 'Community', section: 'social' },
  { href: '/news', icon: Newspaper, label: 'Dev News', section: 'other' },
  { href: '/settings', icon: Settings, label: 'Settings', section: 'other' },
];

const sections = [
  { key: 'main', label: 'Main' },
  { key: 'learn', label: 'Learn' },
  { key: 'ai', label: 'AI Powered' },
  { key: 'progress', label: 'Progress' },
  { key: 'social', label: 'Social' },
  { key: 'other', label: 'Other' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications] = useState(3);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-[#111118] border-r border-white/5 z-40 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display font-bold text-white whitespace-nowrap">
                DSATracker
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {sections.map(section => {
            const items = navItems.filter(i => i.section === section.key);
            return (
              <div key={section.key}>
                {sidebarOpen && (
                  <div className="px-4 mb-2">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{section.label}</span>
                  </div>
                )}
                <div className="space-y-0.5 px-2">
                  {items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} data-tooltip={!sidebarOpen ? item.label : undefined}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer relative ${
                          active ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                        }`}>
                          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r" />}
                          <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} style={{ width: 18, height: 18 }} />
                          <AnimatePresence>
                            {sidebarOpen && (
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap flex-1">
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {sidebarOpen && item.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                              item.badge === 'AI' ? 'bg-violet-500/20 text-violet-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User section */}
        <div className="border-t border-white/5 p-3">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {session?.user?.name?.[0] || 'U'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-600 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30 }} className="lg:hidden fixed left-0 top-0 h-full w-64 bg-[#111118] border-r border-white/5 z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-white">DSATracker</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${
                      pathname === item.href ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                    }`}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{item.badge}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 w-72 group focus-within:border-indigo-500/30">
              <Search className="w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search problems, notes..." className="bg-transparent border-0 text-sm text-gray-300 placeholder-gray-600 outline-none flex-1 p-0" />
              <kbd className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              <NotificationBell />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer">
                {session?.user?.name?.[0] || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
