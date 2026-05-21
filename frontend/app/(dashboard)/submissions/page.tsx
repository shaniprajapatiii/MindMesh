'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, History, Search, Code2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { codeApi } from '@/lib/api';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await codeApi.history({
          ...(status ? { status } : {}),
          ...(language ? { language } : {}),
        });
        setSubmissions(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, language]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const title = submission.problem?.title || '';
      return !q || title.toLowerCase().includes(q) || submission.language?.toLowerCase().includes(q) || submission.status?.toLowerCase().includes(q);
    });
  }, [query, submissions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-3">
            <History className="w-3.5 h-3.5" /> Submission history
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Submissions</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            Review real attempts, compare runtimes, and revisit failed submissions as part of your learning loop.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by problem or language" className="pl-9 w-72 max-w-full" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="min-w-40">
            <option value="">All statuses</option>
            <option value="accepted">Accepted</option>
            <option value="wrong_answer">Wrong Answer</option>
            <option value="compile_error">Compile Error</option>
            <option value="attempted">Attempted</option>
          </select>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="min-w-32">
            <option value="">All languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Total attempts', value: submissions.length },
          { label: 'Accepted', value: submissions.filter(s => s.status === 'accepted').length },
          { label: 'Unique problems', value: new Set(submissions.map(s => s.problemId)).size },
        ].map(card => (
          <div key={card.label} className="glass-card rounded-2xl p-5 border border-white/8">
            <div className="text-xs uppercase tracking-wider text-gray-500">{card.label}</div>
            <div className="text-2xl font-bold text-white mt-2">{loading ? '...' : card.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Code2 className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            No submissions match the current filters.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                <th className="px-4 py-3">Problem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Runtime</th>
                <th className="px-4 py-3">Memory</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr key={submission.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-white font-medium">{submission.problem?.title || submission.problemId}</div>
                    <div className="text-xs text-gray-500">{submission.problem?.platform || 'Unknown'} · {submission.problem?.difficulty || 'Unknown'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2.5 py-1 rounded-full border ${submission.status === 'accepted' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                      {submission.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 capitalize">{submission.language}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{submission.runtime ? `${submission.runtime}ms` : '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{submission.memory ? `${submission.memory.toFixed(1)}MB` : '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(submission.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Why it exists: to turn every attempt into a reviewable learning artifact.</span>
        <Link href="/problems" className="text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1">
          Practice more <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}