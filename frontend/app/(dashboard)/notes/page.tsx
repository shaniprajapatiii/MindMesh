'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Plus, Search, Trash2, Tag, Link2, BookOpen, FileText, Eye, Edit3, Save, X, Hash, Clock, Star, StarOff } from 'lucide-react';
import toast from 'react-hot-toast';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Note {
  id: string;
  title: string;
  content: string;
  mode: 'simple' | 'markdown';
  tags: string[];
  problemId?: string;
  problemTitle?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        const tags = [...new Set(data.flatMap((n: Note) => n.tags))] as string[];
        setAllTags(tags);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const createNote = (mode: 'simple' | 'markdown') => {
    const newNote: Note = {
      id: `temp-${Date.now()}`,
      title: 'Untitled Note',
      content: mode === 'markdown' ? '# My Note\n\nStart writing here...\n\n## Approach\n\n## Code\n\n```python\n\n```\n\n## Time Complexity\n\n## Space Complexity\n' : '',
      mode,
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedNote(newNote);
    setShowEditor(true);
    setIsPreview(false);
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const method = selectedNote.id.startsWith('temp-') ? 'POST' : 'PUT';
      const url = selectedNote.id.startsWith('temp-') ? '/api/notes' : `/api/notes/${selectedNote.id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedNote),
      });
      if (res.ok) {
        const saved = await res.json();
        setSelectedNote(saved);
        await fetchNotes();
        toast.success('Note saved!');
      }
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) { setSelectedNote(null); setShowEditor(false); }
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const togglePin = async (note: Note) => {
    const updated = { ...note, pinned: !note.pinned };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
    await fetch(`/api/notes/${note.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
  };

  const addTag = () => {
    if (!newTagInput.trim() || !selectedNote) return;
    const tag = newTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!selectedNote.tags.includes(tag)) {
      setSelectedNote({ ...selectedNote, tags: [...selectedNote.tags, tag] });
    }
    setNewTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, tags: selectedNote.tags.filter(t => t !== tag) });
  };

  const generateAINotes = async () => {
    if (!aiTopic.trim()) return toast.error('Enter a topic or problem name');
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic }),
      });
      const data = await res.json();
      const aiNote: Note = {
        id: `temp-${Date.now()}`,
        title: `AI Notes: ${aiTopic}`,
        content: data.content,
        mode: 'markdown',
        tags: ['ai-generated', ...data.tags || []],
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedNote(aiNote);
      setShowEditor(true);
      setIsPreview(true);
      toast.success('AI notes generated!');
    } catch { toast.error('AI generation failed'); }
    finally { setAiGenerating(false); }
  };

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || n.tags.includes(filterTag);
    return matchSearch && matchTag;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0f]">
      {/* Sidebar */}
      <div className="w-72 bg-[#111118] border-r border-white/5 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">My Notes</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{notes.length}</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="w-full pl-8 text-xs py-2" />
          </div>

          {/* AI Note Generator */}
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateAINotes()}
                placeholder="e.g. Two Sum, Binary Search..."
                className="flex-1 text-xs py-2"
              />
              <button
                onClick={generateAINotes}
                disabled={aiGenerating}
                className="btn btn-primary text-xs px-2.5 py-1.5 flex-shrink-0"
                title="Generate AI notes"
              >
                {aiGenerating ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '🧠 AI'}
              </button>
            </div>
          </div>

          {/* New note buttons */}
          <div className="flex gap-2 mt-2">
            <button onClick={() => createNote('simple')} className="flex-1 btn btn-secondary text-xs py-1.5 gap-1.5">
              <FileText className="w-3 h-3" /> Simple
            </button>
            <button onClick={() => createNote('markdown')} className="flex-1 btn btn-secondary text-xs py-1.5 gap-1.5">
              <BookOpen className="w-3 h-3" /> Markdown
            </button>
          </div>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5">
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setFilterTag('')} className={`text-xs px-2 py-0.5 rounded-full transition-all ${!filterTag ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>All</button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag === filterTag ? '' : tag)} className={`text-xs px-2 py-0.5 rounded-full transition-all ${filterTag === tag ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-white/4">
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            ))
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600">
              <BookOpen className="w-8 h-8 mb-2" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Create your first note!</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => { setSelectedNote(note); setShowEditor(true); }}
                className={`p-4 border-b border-white/4 cursor-pointer hover:bg-white/3 transition-all group ${selectedNote?.id === note.id ? 'bg-indigo-500/8 border-l-2 border-l-indigo-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-white truncate flex-1">{note.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); togglePin(note); }} className="p-0.5 text-gray-500 hover:text-amber-400">
                      {note.pinned ? <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> : <StarOff className="w-3 h-3" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }} className="p-0.5 text-gray-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">{note.content.replace(/[#*`]/g, '').slice(0, 80)}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${note.mode === 'markdown' ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-500/15 text-blue-400'}`}>
                    {note.mode === 'markdown' ? 'MD' : 'TXT'}
                  </span>
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] text-gray-600">#{tag}</span>
                  ))}
                  <span className="text-[10px] text-gray-600 ml-auto flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!showEditor || !selectedNote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Select a note to edit</p>
            <p className="text-sm mb-6">or create a new one</p>
            <div className="flex gap-3">
              <button onClick={() => createNote('simple')} className="btn btn-secondary">
                <FileText className="w-4 h-4" /> New Simple Note
              </button>
              <button onClick={() => createNote('markdown')} className="btn btn-primary">
                <BookOpen className="w-4 h-4" /> New Markdown Note
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#111118] flex-shrink-0 gap-3">
              <input
                type="text"
                value={selectedNote.title}
                onChange={e => setSelectedNote({ ...selectedNote, title: e.target.value })}
                className="flex-1 bg-transparent border-0 outline-none text-white font-semibold text-base placeholder-gray-600 focus:ring-0"
                placeholder="Note title..."
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedNote.mode === 'markdown' && (
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${isPreview ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                  >
                    {isPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isPreview ? 'Edit' : 'Preview'}
                  </button>
                )}
                <button onClick={saveNote} disabled={saving} className="btn btn-primary text-xs px-3 py-1.5 gap-1.5">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
                <button onClick={() => { setShowEditor(false); setSelectedNote(null); }} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 flex-wrap flex-shrink-0 bg-[#111118]">
              <Tag className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              {selectedNote.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-400 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="text-xs py-0.5 px-2 w-24 border-dashed"
                />
              </div>
              {selectedNote.problemTitle && (
                <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                  <Link2 className="w-3 h-3" />
                  Linked to: {selectedNote.problemTitle}
                </span>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto" data-color-mode="dark">
              {selectedNote.mode === 'simple' ? (
                <textarea
                  value={selectedNote.content}
                  onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
                  className="w-full h-full bg-transparent border-0 outline-none resize-none p-6 text-gray-200 text-sm leading-relaxed font-mono focus:ring-0"
                  placeholder="Start writing your notes..."
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              ) : isPreview ? (
                <div className="p-6 prose prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                </div>
              ) : (
                <div className="h-full" data-color-mode="dark">
                  <MDEditor
                    value={selectedNote.content}
                    onChange={val => setSelectedNote({ ...selectedNote, content: val || '' })}
                    height="100%"
                    preview="edit"
                    style={{ background: 'transparent', border: 'none' }}
                    textareaProps={{ style: { background: 'transparent', color: '#f0f0f8' } }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
