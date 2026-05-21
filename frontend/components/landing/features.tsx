'use client';
import { motion } from 'framer-motion';
import { Brain, Code2, PenTool, BarChart3, Users, Zap, BookOpen, Target } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Mentor Mode',
    description: 'Get multi-level hints instead of full solutions. Think → Approach → Pseudocode. Learn, not copy.',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    tag: 'AI-Powered',
  },
  {
    icon: Code2,
    title: 'Multi-Platform Tracker',
    description: 'Sync LeetCode, Codeforces, CodeChef, GFG automatically. One dashboard for all your coding platforms.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    tag: 'Tracker',
  },
  {
    icon: PenTool,
    title: 'Canvas Visualizer',
    description: 'Draw linked lists, trees, graphs, stacks, queues with interactive canvas. AI dry-run visualization.',
    color: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    tag: 'Interactive',
  },
  {
    icon: BookOpen,
    title: 'Smart Notes System',
    description: 'Plain notes + full Markdown editor with live preview. Auto-link related problems. Tag and organize.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    tag: 'Notes',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'GitHub-style heatmap, topic mastery, speed analysis, weak area detection. Know exactly where to improve.',
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
    tag: 'Analytics',
  },
  {
    icon: Target,
    title: 'DSA Sheets Hub',
    description: 'Striver, Love Babbar, Blind 75 and more. Track your sheet completion. Custom sheet builder.',
    color: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    tag: 'Sheets',
  },
  {
    icon: Users,
    title: 'Social + Community',
    description: 'Leaderboards, study groups, discussion forums. Compare with friends, college batch, compete globally.',
    color: 'from-indigo-500/20 to-blue-500/20',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    tag: 'Social',
  },
  {
    icon: Zap,
    title: 'Built-in Code Editor',
    description: 'Monaco editor supporting Java, C++, Python, JavaScript. Run test cases, view output, submit solutions.',
    color: 'from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    tag: 'Editor',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-6">
            Everything you need
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Features</span> that set you apart
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Not just a problem tracker. A complete ecosystem to level up your DSA game from beginner to FAANG-ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card rounded-2xl p-6 cursor-pointer group hover:border-opacity-50 bg-gradient-to-br ${feature.color} border ${feature.border} transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <div className="mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${feature.iconBg} ${feature.iconColor} font-medium`}>
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2 group-hover:gradient-text transition-all">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
