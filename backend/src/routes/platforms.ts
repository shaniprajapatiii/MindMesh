import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { mongoDb } from '../lib/db';
import axios from 'axios';
import { fetchUpcomingContests } from '../services/contests';

const router = Router();

// POST /api/platforms/sync/:platform
router.post('/sync/:platform', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { platform } = req.params;
    const user = await mongoDb.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let result: any = {};

    switch (platform.toLowerCase()) {
      case 'leetcode':
        if (!user.leetcodeId) return res.status(400).json({ message: 'LeetCode ID not set' });
        result = await syncLeetCode(user.leetcodeId, req.user!.id);
        break;
      case 'codeforces':
        if (!user.codeforcesId) return res.status(400).json({ message: 'Codeforces ID not set' });
        result = await syncCodeforces(user.codeforcesId, req.user!.id);
        break;
      case 'codechef':
        if (!user.codechefId) return res.status(400).json({ message: 'CodeChef ID not set' });
        result = await syncCodeChef(user.codechefId, req.user!.id);
        break;
      case 'gfg':
        if (!user.gfgId) return res.status(400).json({ message: 'GFG ID not set' });
        result = await syncGFG(user.gfgId, req.user!.id);
        break;
      default:
        return res.status(400).json({ message: 'Unknown platform' });
    }

    res.json({ success: true, ...result });
  } catch (e: any) {
    console.error('Sync error:', e);
    res.status(500).json({ message: e.message || 'Sync failed' });
  }
});

// GET /api/platforms/contests - Upcoming contests
router.get('/contests', async (_, res: Response) => {
  try {
    res.json(await fetchUpcomingContests());
  } catch { res.status(500).json([]); }
});

async function syncLeetCode(username: string, userId: string) {
  try {
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats { acSubmissionNum { difficulty count } }
          profile { ranking }
        }
        userContestRanking(username: $username) { rating }
      }
    `;
    const { data } = await axios.post('https://leetcode.com/graphql', { query, variables: { username } }, {
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      timeout: 10000,
    });

    const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
    const all = stats.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    await mongoDb.user.update({
      where: { id: userId },
      data: { leetcodeSolved: all, leetcodeEasy: easy, leetcodeMedium: medium, leetcodeHard: hard },
    });

    return { solved: all, easy, medium, hard, platform: 'LeetCode' };
  } catch (e) {
    throw new Error('Failed to sync LeetCode. Check your username.');
  }
}

async function syncCodeforces(handle: string, userId: string) {
  try {
    const [userRes, submissionsRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 8000 }),
      axios.get(`https://codeforces.com/api/user.status?handle=${handle}&count=500`, { timeout: 8000 }),
    ]);

    const user = userRes.data?.result?.[0];
    if (!user) throw new Error('User not found');

    const rating = user.rating || 0;
    const maxRating = user.maxRating || 0;
    const rank = user.rank || '';

    // Count unique solved problems
    const solved = new Set<string>();
    const submissions = submissionsRes.data?.result || [];
    submissions.forEach((s: any) => {
      if (s.verdict === 'OK') solved.add(`${s.problem.contestId}-${s.problem.index}`);
    });

    await mongoDb.user.update({
      where: { id: userId },
      data: { cfRating: rating, cfMaxRating: maxRating, cfRank: rank },
    });

    return { rating, maxRating, rank, solved: solved.size, platform: 'Codeforces' };
  } catch (e) {
    throw new Error('Failed to sync Codeforces. Check your handle.');
  }
}

async function syncCodeChef(username: string, userId: string) {
  try {
    // CodeChef doesn't have an official public API, use unofficial endpoint
    const { data } = await axios.get(`https://www.codechef.com/users/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });

    // Parse rating from HTML (basic scraping)
    const ratingMatch = data.match(/Current Rating<\/div>\s*<div[^>]*>(\d+)/);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    const starsMatch = data.match(/(\d+)\s*★/);
    const stars = starsMatch ? parseInt(starsMatch[1]) : 0;

    await mongoDb.user.update({ where: { id: userId }, data: { codechefRating: rating, codechefStars: stars } });
    return { rating, stars, platform: 'CodeChef' };
  } catch {
    throw new Error('Failed to sync CodeChef. Profile may be private.');
  }
}

async function syncGFG(username: string, userId: string) {
  try {
    const { data } = await axios.get(`https://auth.geeksforgeeks.org/user/${username}/practice/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });

    const scoreMatch = data.match(/Overall Coding Score[^>]*>([^<]+)/);
    const solvedMatch = data.match(/(\d+)\s*problem/i);

    const score = scoreMatch ? parseInt(scoreMatch[1].replace(/,/g, '')) : 0;
    const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

    await mongoDb.user.update({ where: { id: userId }, data: { gfgScore: score, gfgSolved: solved } });
    return { score, solved, platform: 'GFG' };
  } catch {
    throw new Error('Failed to sync GFG. Check your username.');
  }
}

export default router;
