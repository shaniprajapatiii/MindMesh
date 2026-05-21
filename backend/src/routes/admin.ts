import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/db';

const router = Router();

router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    const [users, submissions, notes, badges, activity] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, lastActiveDate: true, leetcodeId: true, codeforcesId: true, codechefId: true, gfgId: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.submission.findMany({
        include: { problem: { select: { title: true, platform: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.note.count(),
      prisma.userBadge.count(),
      prisma.activityLog.count(),
    ]);

    const platformHealth = {
      leetcode: users.filter(user => !!user.leetcodeId).length,
      codeforces: users.filter(user => !!user.codeforcesId).length,
      codechef: users.filter(user => !!user.codechefId).length,
      gfg: users.filter(user => !!user.gfgId).length,
    };

    res.json({
      totals: {
        users: users.length,
        submissions: submissions.length,
        notes,
        badges,
        activities: activity,
      },
      platformHealth,
      recentUsers: users.slice(0, 12),
      recentSubmissions: submissions,
    });
  } catch (e) {
    console.error('Admin overview error:', e);
    res.status(500).json({ message: 'Failed to load admin overview' });
  }
});

export default router;