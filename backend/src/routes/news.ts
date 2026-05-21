import { Router, Request, Response } from 'express';
import RSSParser from 'rss-parser';

const router = Router();
const rssParser = new RSSParser({ timeout: 5000 });

const RSS_FEEDS = [
  { url: 'https://dev.to/feed/tag/algorithms', category: 'DSA Tips' },
  { url: 'https://dev.to/feed/tag/programming', category: 'Tech News' },
  { url: 'https://dev.to/feed/tag/career', category: 'Career' },
  { url: 'https://codeforces.com/rss/announcements', category: 'Contests' },
  { url: 'https://dev.to/feed/tag/tutorial', category: 'Tutorials' },
];

let cache: { data: any[]; ts: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category = 'All' } = req.query as Record<string,string>;
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      const filtered = category === 'All' ? cache.data : cache.data.filter(i => i.category === category);
      return res.json(filtered.slice(0, 30));
    }
    const results = await Promise.allSettled(RSS_FEEDS.map(async feed => {
      const parsed = await rssParser.parseURL(feed.url);
      return parsed.items.slice(0, 8).map(item => ({
        id: item.guid || item.link || Math.random().toString(36),
        title: item.title || '',
        description: (item.contentSnippet || item.content || '').slice(0, 200),
        url: item.link || '',
        image: (item as any).enclosure?.url || null,
        source: parsed.title || new URL(feed.url).hostname,
        category: feed.category,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        trending: Math.random() > 0.75,
      }));
    }));
    const all: any[] = [];
    results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
    all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    cache = { data: all, ts: Date.now() };
    const filtered = category === 'All' ? all : all.filter(i => i.category === category);
    res.json(filtered.slice(0, 30));
  } catch (e) { console.error('News error:', e); res.status(500).json([]); }
});

export default router;
