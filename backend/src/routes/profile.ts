import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, username: true, email: true, avatar: true, bio: true,
        location: true, college: true, github: true, twitter: true, linkedin: true,
        isPublic: true, streak: true, maxStreak: true, xp: true, level: true,
        leetcodeId: true, codeforcesId: true, codechefId: true, gfgId: true, githubId: true,
        leetcodeSolved: true, leetcodeEasy: true, leetcodeMedium: true, leetcodeHard: true,
        cfRating: true, codechefRating: true, gfgSolved: true, gfgScore: true,
        badges: { select: { badgeId: true } }, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'Not found' });

    const totalSolved = await prisma.userProblemStatus.count({ where: { userId: req.user!.id, status: 'solved' } });
    const userXp = (await prisma.user.findUnique({ where: { id: req.user!.id }, select: { xp: true } }))?.xp || 0;
    const rank = await prisma.user.count({ where: { xp: { gt: userXp }, showOnLeader: true } }) + 1;

    res.json({
      ...user, totalSolved, rank,
      badges: user.badges.map(b => b.badgeId),
      codeforcesRating: user.cfRating,
      leetcode: { solved: user.leetcodeSolved, easy: user.leetcodeEasy, medium: user.leetcodeMedium, hard: user.leetcodeHard },
      codeforces: { rating: user.cfRating },
      codechef: { rating: user.codechefRating },
      gfg: { solved: user.gfgSolved, score: user.gfgScore },
    });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed' }); }
});

router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['name', 'bio', 'location', 'college', 'github', 'twitter', 'linkedin', 'isPublic', 'leetcodeId', 'codeforcesId', 'codechefId', 'gfgId', 'githubId'];
    const data: Record<string, any> = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    const user = await prisma.user.update({ where: { id: req.user!.id }, data });
    res.json(user);
  } catch { res.status(500).json({ message: 'Failed to update profile' }); }
});

router.get('/:username', optionalAuth as any, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, name: true, username: true, avatar: true, bio: true, location: true,
        college: true, isPublic: true, streak: true, maxStreak: true, xp: true, level: true,
        leetcodeSolved: true, cfRating: true, codechefRating: true, gfgSolved: true,
        badges: { select: { badgeId: true } }, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isPublic) return res.status(403).json({ message: 'Profile is private' });

    const totalSolved = await prisma.userProblemStatus.count({ where: { userId: user.id, status: 'solved' } });
    res.json({ ...user, totalSolved, badges: user.badges.map(b => b.badgeId) });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

export default router;
