'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Bookmark, RefreshCw, Tag, TrendingUp } from 'lucide-react';

const NEWS_CATEGORIES = ['All', 'DSA Tips', 'System Design', 'Contests', 'Tech News', 'Career', 'Tutorials'];

export default function NewsPage() {
  const [category, setCategory] = useState('All');
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchNews(); }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${category}`);
      if (res.ok) setNews(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-display font-bold text-white">Dev News</h1>
          </div>
          <p className="text-gray-500 text-sm">Stay updated with DSA & tech world</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn btn-secondary text-sm gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {NEWS_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${category === c ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/8 border border-white/8'}`}>{c}</button>
        ))}
      </div>

      {/* News grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? [...Array(9)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl overflow-hidden">
            <div className="skeleton h-40" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 rounded w-3/4" />
              <div className="skeleton h-3 rounded w-full" />
              <div className="skeleton h-3 rounded w-2/3" />
            </div>
          </div>
        )) : news.length === 0 ? (
          <div className="col-span-3 text-center py-16 glass-card rounded-xl">
            <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-500">No news available. Check back later!</p>
          </div>
        ) : news.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
            {item.image && (
              <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{item.category || category}</span>
                {item.trending && <span className="text-[10px] flex items-center gap-0.5 text-emerald-400"><TrendingUp className="w-2.5 h-2.5" />Trending</span>}
              </div>
              <h3 className="text-white font-semibold text-sm leading-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">{item.description || item.summary}</p>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-gray-600">
                  {item.source} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Recent'}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleBookmark(item.id)} className={`p-1.5 rounded-lg transition-all ${bookmarked.has(item.id) ? 'text-amber-400 bg-amber-500/10' : 'text-gray-600 hover:text-amber-400 hover:bg-white/5'}`}>
                    <Bookmark className="w-3.5 h-3.5" fill={bookmarked.has(item.id) ? 'currentColor' : 'none'} />
                  </button>
                  <a href={item.url} target="_blank" rel="noopener" className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-white/5 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
