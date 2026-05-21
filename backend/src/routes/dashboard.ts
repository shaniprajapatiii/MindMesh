import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { streak: true, maxStreak: true, cfRating: true, leetcodeSolved: true, leetcodeEasy: true, leetcodeMedium: true, leetcodeHard: true, codechefRating: true, gfgSolved: true, xp: true, level: true },
    });
    const totalSolved = await prisma.userProblemStatus.count({ where: { userId: req.user!.id, status: 'solved' } });
    res.json({
      ...user, totalSolved,
      leetcode: { solved: user?.leetcodeSolved || 0, easy: user?.leetcodeEasy || 0, medium: user?.leetcodeMedium || 0, hard: user?.leetcodeHard || 0 },
      codeforces: { rating: user?.cfRating || 0 },
      codechef: { rating: user?.codechefRating || 0 },
      gfg: { solved: user?.gfgSolved || 0 },
    });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.get('/activity', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({ where: { userId: req.user!.id }, select: { dateStr: true, count: true } });
    const map: Record<string, number> = {};
    logs.forEach(l => { map[l.dateStr] = l.count; });
    res.json(map);
  } catch { res.status(500).json({}); }
});

router.get('/recent-problems', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const statuses = await prisma.userProblemStatus.findMany({
      where: { userId: req.user!.id },
      include: { problem: { select: { title: true, difficulty: true, platform: true } } },
      orderBy: { solvedAt: 'desc' },
      take: 10,
    });
    res.json(statuses.map(s => ({
      id: s.problemId, title: s.problem.title, difficulty: s.problem.difficulty,
      platform: s.problem.platform, status: s.status,
      timeAgo: s.solvedAt ? getTimeAgo(s.solvedAt) : 'Not solved',
    })));
  } catch { res.status(500).json([]); }
});

function getTimeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default router;
