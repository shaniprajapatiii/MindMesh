'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, BookOpen, Code2, FileText, ChevronRight, CheckCircle, Clock, Tag, Brain, Bookmark, BookmarkCheck, Play } from 'lucide-react';

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'submissions' | 'similar'>('description');
  const [notes, setNotes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [aiNotes, setAiNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/problems/${id}`).then(r => r.json()),
      fetch(`/api/notes?problemId=${id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/code/submissions/${id}`).then(r => r.json()).catch(() => []),
    ]).then(([p, n, s]) => {
      setProblem(p);
      setBookmarked(p.bookmarked);
      setNotes(Array.isArray(n) ? n.filter((note: any) => note.problemId === id) : []);
      setSubmissions(Array.isArray(s) ? s : []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [id]);

  const generateAINotes = async () => {
    if (!problem) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: problem.title }),
      });
      const data = await res.json();
      setAiNotes(data.content || '');
      setActiveTab('notes');
    } catch {}
    finally { setAiLoading(false); }
  };

  const toggleBookmark = async () => {
    const res = await fetch(`/api/problems/${id}/bookmark`, { method: 'POST' });
    if (res.ok) setBookmarked(b => !b);
  };

  const markSolved = async () => {
    await fetch(`/api/problems/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: problem.userStatus === 'solved' ? 'unsolved' : 'solved' }),
    });
    setProblem((p: any) => ({ ...p, userStatus: p.userStatus === 'solved' ? 'unsolved' : 'solved' }));
  };

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
  );

  if (!problem) return (
    <div className="p-6 text-center text-gray-500">
      <p>Problem not found</p>
      <Link href="/problems" className="btn btn-secondary text-sm mt-4">← Back to Problems</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <Link href="/problems" className="hover:text-gray-300 transition-colors">Problems</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-300">{problem.title}</span>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {problem.number && <span className="text-gray-500 text-sm">#{problem.number}</span>}
              <h1 className="text-xl font-bold text-white">{problem.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                {problem.difficulty}
              </span>
              {problem.isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Premium</span>}
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded-full platform-${problem.platform?.toLowerCase()}`}>{problem.platform}</span>
              {problem.topic && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{problem.topic}</span>}
              {problem.acceptance && <span>Acceptance: {problem.acceptance}%</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleBookmark} className={`p-2 rounded-lg border transition-all ${bookmarked ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'border-white/10 text-gray-500 hover:text-amber-400 hover:border-amber-500/20'}`}>
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button onClick={markSolved} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${problem.userStatus === 'solved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'border-white/10 text-gray-400 hover:border-emerald-500/20 hover:text-emerald-400'}`}>
              <CheckCircle className="w-4 h-4" />
              {problem.userStatus === 'solved' ? 'Solved' : 'Mark Solved'}
            </button>
            <Link href={`/dry-run?problem=${encodeURIComponent(problem.title)}`} className="btn btn-secondary text-sm px-4 py-2 gap-2">
              <Play className="w-4 h-4" /> Dry Run
            </Link>
            <Link href={`/ai-mentor?problem=${encodeURIComponent(problem.title)}`} className="btn btn-secondary text-sm px-4 py-2 gap-2">
              <Brain className="w-4 h-4" /> AI Mentor
            </Link>
            <Link href={`/editor?problem=${id}`} className="btn btn-primary text-sm px-4 py-2 gap-2">
              <Code2 className="w-4 h-4" /> Solve
            </Link>
            <a href={problem.url} target="_blank" rel="noopener" className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-blue-400 hover:border-blue-500/20 transition-all">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
            {problem.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/8">{tag}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-5">
        {[
          { key: 'description', icon: FileText, label: 'Description' },
          { key: 'notes', icon: BookOpen, label: `Notes${notes.length ? ` (${notes.length})` : ''}` },
          { key: 'submissions', icon: Clock, label: `Submissions${submissions.length ? ` (${submissions.length})` : ''}` },
          { key: 'similar', icon: Tag, label: 'Similar' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'description' && (
          <div className="glass-card rounded-xl p-6 space-y-5">
            {problem.description ? (
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description }} />
            ) : (
              <div className="text-gray-400 text-sm leading-relaxed">
                <p>This problem requires you to find a solution given the constraints. Open the problem on {problem.platform} to see the full description.</p>
                <a href={problem.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  View on {problem.platform} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            {problem.examples?.map((ex: any, i: number) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-2">Example {i + 1}</h4>
                <div className="bg-white/4 rounded-xl p-4 font-mono text-sm border border-white/8 space-y-1">
                  <div><span className="text-gray-500">Input: </span><span className="text-gray-200">{ex.input}</span></div>
                  <div><span className="text-gray-500">Output: </span><span className="text-emerald-300">{ex.output}</span></div>
                  {ex.explanation && <div className="text-gray-500 text-xs mt-1"><span className="text-gray-600">Explanation: </span>{ex.explanation}</div>}
                </div>
              </div>
            ))}
            {problem.constraints && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-2">Constraints</h4>
                <div className="bg-white/4 rounded-xl p-4 text-gray-400 text-sm border border-white/8">{problem.constraints}</div>
              </div>
            )}
            <div className="pt-2 border-t border-white/5 flex gap-3">
              <button onClick={generateAINotes} disabled={aiLoading} className="btn btn-secondary text-sm gap-2">
                {aiLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" /> : <Brain className="w-4 h-4 text-violet-400" />}
                Generate AI Notes
              </button>
              <Link href={`/editor?problem=${id}`} className="btn btn-primary text-sm gap-2">
                <Code2 className="w-4 h-4" /> Open in Editor
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {aiNotes && (
              <div className="glass-card rounded-xl p-5 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-semibold text-sm">AI-Generated Notes</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">Auto-generated</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300">{aiNotes}</div>
              </div>
            )}
            {notes.length === 0 && !aiNotes ? (
              <div className="glass-card rounded-xl p-10 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-500 text-sm mb-4">No notes for this problem yet</p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/notes?problem=${id}`} className="btn btn-secondary text-sm">Create Note</Link>
                  <button onClick={generateAINotes} disabled={aiLoading} className="btn btn-primary text-sm gap-2">
                    <Brain className="w-4 h-4" /> Generate AI Notes
                  </button>
                </div>
              </div>
            ) : notes.map((note: any) => (
              <div key={note.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{note.title}</h3>
                  <Link href={`/notes`} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</Link>
                </div>
                <p className="text-gray-400 text-sm">{note.content.slice(0, 200)}{note.content.length > 200 ? '...' : ''}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="glass-card rounded-xl overflow-hidden">
            {submissions.length === 0 ? (
              <div className="p-10 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-500 text-sm mb-3">No submissions yet</p>
                <Link href={`/editor?problem=${id}`} className="btn btn-primary text-sm">Solve Now</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-3">Language</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-3">Runtime</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-3">Memory</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub: any) => (
                    <tr key={sub.id} className="border-b border-white/4 hover:bg-white/2 transition-all">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${sub.status === 'accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sub.status === 'accepted' ? '✓ Accepted' : '✗ ' + sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 capitalize">{sub.language}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{sub.runtime ? `${sub.runtime}ms` : '--'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{sub.memory ? `${sub.memory.toFixed(1)}MB` : '--'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="glass-card rounded-xl p-5">
            <p className="text-gray-500 text-sm text-center py-6">Similar problems feature coming soon. <Link href="/problems" className="text-indigo-400 hover:text-indigo-300">Browse all problems →</Link></p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
