import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query as Record<string, string>;
    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : 365;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [allSolved, submissions, activity, user] = await Promise.all([
      prisma.userProblemStatus.findMany({
        where: { userId: req.user!.id, status: 'solved', solvedAt: { gte: since } },
        include: { problem: { select: { topic: true, difficulty: true, platform: true } } },
      }),
      prisma.submission.findMany({
        where: { userId: req.user!.id, createdAt: { gte: since } },
        include: { problem: { select: { difficulty: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.activityLog.findMany({
        where: { userId: req.user!.id, date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { streak: true, maxStreak: true, xp: true, level: true, leetcodeSolved: true, cfRating: true, codechefRating: true, gfgSolved: true },
      }),
    ]);

    // Topic breakdown
    const topicMap: Record<string, { solved: number; easy: number; medium: number; hard: number }> = {};
    allSolved.forEach(s => {
      const t = s.problem.topic || 'Other';
      if (!topicMap[t]) topicMap[t] = { solved: 0, easy: 0, medium: 0, hard: 0 };
      topicMap[t].solved++;
      if (s.problem.difficulty === 'Easy') topicMap[t].easy++;
      else if (s.problem.difficulty === 'Medium') topicMap[t].medium++;
      else topicMap[t].hard++;
    });

    // Difficulty breakdown
    const diffMap = { Easy: 0, Medium: 0, Hard: 0 };
    allSolved.forEach(s => { if (s.problem.difficulty in diffMap) (diffMap as any)[s.problem.difficulty]++; });

    // Platform breakdown
    const platformMap: Record<string, number> = {};
    allSolved.forEach(s => {
      const p = s.problem.platform;
      platformMap[p] = (platformMap[p] || 0) + 1;
    });

    // Monthly aggregation for chart
    const monthlyMap: Record<string, { easy: number; medium: number; hard: number }> = {};
    allSolved.forEach(s => {
      const month = s.solvedAt?.toISOString().slice(0, 7) || '';
      if (!monthlyMap[month]) monthlyMap[month] = { easy: 0, medium: 0, hard: 0 };
      if (s.problem.difficulty === 'Easy') monthlyMap[month].easy++;
      else if (s.problem.difficulty === 'Medium') monthlyMap[month].medium++;
      else monthlyMap[month].hard++;
    });

    // Submission speed by difficulty
    const speedMap: Record<string, number[]> = { Easy: [], Medium: [], Hard: [] };
    submissions.filter(s => s.runtime).forEach(s => {
      const d = s.problem.difficulty;
      if (d in speedMap) speedMap[d].push(s.runtime!);
    });

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    res.json({
      totalSolved: allSolved.length,
      difficultyBreakdown: diffMap,
      topicBreakdown: topicMap,
      platformBreakdown: platformMap,
      monthlyData: Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v })),
      activityData: activity.map(a => ({ date: a.dateStr, count: a.count })),
      speedAnalysis: {
        Easy: { avg: avg(speedMap.Easy), count: speedMap.Easy.length },
        Medium: { avg: avg(speedMap.Medium), count: speedMap.Medium.length },
        Hard: { avg: avg(speedMap.Hard), count: speedMap.Hard.length },
      },
      userStats: user,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({});
  }
});

export default router;
