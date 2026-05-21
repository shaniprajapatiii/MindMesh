import { Router, Response } from 'express';
import { prisma } from '../lib/db';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/problems
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search = '', difficulty = 'All', platform = 'All', topic = 'All', status = 'All', sortBy = 'id', page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { topic: { contains: search, mode: 'insensitive' } }];
    if (difficulty !== 'All') where.difficulty = difficulty;
    if (platform !== 'All') where.platform = { equals: platform, mode: 'insensitive' };
    if (topic !== 'All') where.topic = { contains: topic, mode: 'insensitive' };

    const orderBy: any = { id: 'asc' };
    if (sortBy === 'difficulty') orderBy.difficulty = 'asc';
    if (sortBy === 'title') orderBy.title = 'asc';
    if (sortBy === 'acceptance') orderBy.acceptance = 'desc';

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({ where, skip, take: parseInt(limit), orderBy }),
      prisma.problem.count({ where }),
    ]);

    // Attach user status if logged in
    let result = problems as any[];
    if (req.user) {
      const statuses = await prisma.userProblemStatus.findMany({
        where: { userId: req.user.id, problemId: { in: problems.map(p => p.id) } },
      });
      const bookmarks = await prisma.problemBookmark.findMany({
        where: { userId: req.user.id, problemId: { in: problems.map(p => p.id) } },
      });
      const statusMap = Object.fromEntries(statuses.map(s => [s.problemId, s.status]));
      const bookmarkSet = new Set(bookmarks.map(b => b.problemId));

      result = problems.map(p => ({
        ...p,
        userStatus: status !== 'All' ? statusMap[p.id] || 'unsolved' : statusMap[p.id] || 'unsolved',
        bookmarked: bookmarkSet.has(p.id),
      }));

      if (status !== 'All') {
        result = result.filter(p => {
          if (status === 'Solved') return p.userStatus === 'solved';
          if (status === 'Attempted') return p.userStatus === 'attempted';
          if (status === 'Unsolved') return p.userStatus === 'unsolved';
          return true;
        });
      }
    }

    res.json({ problems: result, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const problem = await prisma.problem.findUnique({ where: { id: req.params.id } });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let result: any = { ...problem };
    if (req.user) {
      const [statusRec, bookmark] = await Promise.all([
        prisma.userProblemStatus.findUnique({ where: { userId_problemId: { userId: req.user.id, problemId: problem.id } } }),
        prisma.problemBookmark.findUnique({ where: { userId_problemId: { userId: req.user.id, problemId: problem.id } } }),
      ]);
      result.userStatus = statusRec?.status || 'unsolved';
      result.bookmarked = !!bookmark;
    }
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to fetch problem' });
  }
});

// PUT /api/problems/:id/status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, timeTaken } = req.body;
    const record = await prisma.userProblemStatus.upsert({
      where: { userId_problemId: { userId: req.user!.id, problemId: req.params.id } },
      update: { status, ...(status === 'solved' ? { solvedAt: new Date() } : {}), timeTaken },
      create: { userId: req.user!.id, problemId: req.params.id, status, timeTaken, ...(status === 'solved' ? { solvedAt: new Date() } : {}) },
    });

    // Update activity log if solved
    if (status === 'solved') {
      const today = new Date().toISOString().split('T')[0];
      await prisma.activityLog.upsert({
        where: { userId_dateStr: { userId: req.user!.id, dateStr: today } },
        update: { count: { increment: 1 } },
        create: { userId: req.user!.id, dateStr: today, count: 1 },
      });
      // Update streak
      await updateStreak(req.user!.id);
      // Grant XP
      const problem = await prisma.problem.findUnique({ where: { id: req.params.id }, select: { difficulty: true } });
      const xp = problem?.difficulty === 'Easy' ? 10 : problem?.difficulty === 'Medium' ? 25 : 50;
      await prisma.user.update({ where: { id: req.user!.id }, data: { xp: { increment: xp } } });
    }

    res.json(record);
  } catch {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// POST /api/problems/:id/bookmark
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.problemBookmark.findUnique({
      where: { userId_problemId: { userId: req.user!.id, problemId: req.params.id } },
    });
    if (existing) {
      await prisma.problemBookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false });
    } else {
      await prisma.problemBookmark.create({ data: { userId: req.user!.id, problemId: req.params.id } });
      res.json({ bookmarked: true });
    }
  } catch {
    res.status(500).json({ message: 'Failed to toggle bookmark' });
  }
});

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true, maxStreak: true, lastActiveDate: true } });
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);

  let newStreak = user.streak;
  if (!lastActive || lastActive.getTime() === yesterday.getTime()) {
    newStreak = user.streak + 1;
  } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, maxStreak: Math.max(newStreak, user.maxStreak), lastActiveDate: new Date() },
  });
}

export default router;
