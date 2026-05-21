'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Plus, ThumbsUp, Eye, Clock, Pin, Search, BookOpen, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';

type Tab = 'discussions' | 'groups' | 'study-sessions';

const CATEGORIES = ['All', 'Algorithm Help', 'Solution Discussion', 'Career Advice', 'Contests', 'General'];

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('discussions');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [groupMessage, setGroupMessage] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);
  const [sendingGroupMessage, setSendingGroupMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Algorithm Help', tags: '' });
  const socketRef = useRef<any>(null);

  const selectedGroup = groups.find(group => group.id === selectedGroupId);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'discussions') {
          const res = await fetch(`/api/community/posts?category=${category}&search=${search}`);
          if (res.ok) setPosts(await res.json());
        } else if (tab === 'groups') {
          const res = await fetch('/api/community/groups');
          if (res.ok) {
            const data = await res.json();
            setGroups(data);
            setSelectedGroupId(current => current || data.find((group: any) => group.joined)?.id || data[0]?.id || '');
          }
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [tab, category, search]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket || tab !== 'groups' || !selectedGroupId) return;

    socket.emit('join-group', selectedGroupId);
    const handleMessage = (payload: any) => {
      if (!payload || payload.groupId !== selectedGroupId) return;
      setGroupMessages(prev => [...prev, payload]);
    };

    socket.on('group-message', handleMessage);
    return () => {
      socket.emit('leave-room', `group-${selectedGroupId}`);
      socket.off('group-message', handleMessage);
    };
  }, [tab, selectedGroupId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (tab !== 'groups' || !selectedGroupId) return;
      setGroupLoading(true);
      try {
        setGroupMessages(await communityApi.groupMessages(selectedGroupId));
      } catch {
        setGroupMessages([]);
      } finally {
        setGroupLoading(false);
      }
    };
    loadMessages();
  }, [tab, selectedGroupId]);

  const submitPost = async () => {
    if (!newPost.title.trim()) return toast.error('Add a title');
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPost, tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts(prev => [post, ...prev]);
        setShowNewPost(false);
        setNewPost({ title: '', content: '', category: 'Algorithm Help', tags: '' });
        toast.success('Post created!');
      }
    } catch { toast.error('Failed to post'); }
  };

  const joinGroup = async (id: string) => {
    try {
      await fetch(`/api/community/groups/${id}/join`, { method: 'POST' });
      setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: true, members: g.members + 1 } : g));
      setSelectedGroupId(id);
      toast.success('Joined group!');
    } catch {}
  };

  const sendGroupMessage = async () => {
    if (!selectedGroupId || !groupMessage.trim()) return;
    setSendingGroupMessage(true);
    try {
      const saved = await communityApi.sendGroupMessage(selectedGroupId, groupMessage.trim());
      setGroupMessages(prev => [...prev, saved]);
      socketRef.current?.emit('group-message', { ...saved, groupId: selectedGroupId });
      setGroupMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingGroupMessage(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Community</h1>
          <p className="text-gray-500 text-sm">Discuss, collaborate, grow together</p>
        </div>
        <button onClick={() => setShowNewPost(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-6">
        {([['discussions', MessageSquare, 'Discussions'], ['groups', Users, 'Study Groups'], ['study-sessions', BookOpen, 'Sessions']] as [Tab, any, string][]).map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* New post form */}
      {showNewPost && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 mb-6 border border-indigo-500/20">
          <h3 className="text-white font-semibold mb-4">Create New Post</h3>
          <div className="space-y-3">
            <input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="Post title..." className="w-full" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} className="w-full">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} placeholder="Tags (comma-separated)" className="w-full" />
            </div>
            <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder="Describe your question or discussion..." className="w-full h-28 resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewPost(false)} className="btn btn-secondary text-sm">Cancel</button>
              <button onClick={submitPost} className="btn btn-primary text-sm">Post</button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'discussions' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-8 text-sm" />
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">Categories</div>
              <div className="space-y-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === c ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
            ) : posts.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-xl">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-500 text-sm">No posts yet. Be the first!</p>
              </div>
            ) : posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card rounded-xl p-4 hover:border-white/12 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {post.author?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {post.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">{post.category}</span>
                      {post.tags?.map((t: string) => <span key={t} className="text-[10px] text-gray-600">#{t}</span>)}
                    </div>
                    <h3 className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors mb-1">{post.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.replies || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
                      <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{post.author?.name} · {post.timeAgo || 'just now'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === 'groups' && (
        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-5 items-start">
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-xl p-5 border-dashed border-white/10 hover:border-indigo-500/30 cursor-pointer group transition-all flex flex-col items-center justify-center min-h-44 gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                <Plus className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-center">
                <div className="text-white font-medium text-sm">Create Study Group</div>
                <div className="text-gray-500 text-xs mt-1">Start a group with friends or classmates</div>
              </div>
            </motion.div>

            {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-44 rounded-xl" />) :
            groups.map((group, i) => (
              <motion.button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-xl p-5 hover:-translate-y-1 transition-all text-left border ${selectedGroupId === group.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/8'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xl">{group.emoji || '👥'}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${group.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                    {group.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{group.name}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" />{group.members} members</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); joinGroup(group.id); }}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${group.joined ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25'}`}
                  >
                    {group.joined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-white/8 flex flex-col min-h-[32rem]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold text-sm">Live Group Chat</h3>
                <p className="text-xs text-gray-500">Real-time messages for the selected study group</p>
              </div>
              {selectedGroup && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">{selectedGroup.name}</span>}
            </div>
            {!selectedGroup ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-6 text-center">
                Select or join a group to open the live collaboration chat.
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-black/10">
                  {groupLoading ? (
                    <div className="text-gray-500 text-sm">Loading messages...</div>
                  ) : groupMessages.length === 0 ? (
                    <div className="text-gray-500 text-sm">No messages yet. Start the conversation.</div>
                  ) : groupMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {(message.author?.name || message.author?.username || 'U')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="text-white font-medium">{message.author?.name || message.author?.username || 'User'}</span>
                          <span className="text-gray-600">{message.timeAgo || 'just now'}</span>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/8 px-3 py-2 text-sm text-gray-200 leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/5 bg-[#111118] flex gap-2">
                  <input
                    value={groupMessage}
                    onChange={e => setGroupMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendGroupMessage())}
                    placeholder={`Message ${selectedGroup.name}...`}
                    className="flex-1"
                  />
                  <button onClick={sendGroupMessage} disabled={sendingGroupMessage} className="btn btn-primary text-sm px-4">
                    {sendingGroupMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'study-sessions' && (
        <div className="text-center py-20 glass-card rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-white font-semibold mb-2">Live Study Sessions</h3>
          <p className="text-gray-500 text-sm mb-4">Solve problems together in real-time</p>
          <button className="btn btn-primary">Start a Session</button>
        </div>
      )}
    </div>
  );
}
