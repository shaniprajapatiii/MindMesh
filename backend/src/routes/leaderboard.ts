import { Router, Response } from 'express';
import { prisma } from '../index';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    const { search = '', page = '1' } = req.query as Record<string, string>;
    const limit = 50; const skip = (parseInt(page) - 1) * limit;
    const where: any = { showOnLeader: true };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { username: { contains: search, mode: 'insensitive' } }];
    const users = await prisma.user.findMany({ where, select: { id: true, name: true, username: true, avatar: true, xp: true, streak: true, cfRating: true, leetcodeSolved: true, college: true }, orderBy: { xp: 'desc' }, skip, take: limit });
    const solvedCounts = await prisma.userProblemStatus.groupBy({ by: ['userId'], where: { userId: { in: users.map(u => u.id) }, status: 'solved' }, _count: true });
    const solvedMap: Record<string,number> = Object.fromEntries(solvedCounts.map(s => [s.userId, s._count]));
    const rankings = users.map((u, i) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, rank: skip + i + 1, totalSolved: solvedMap[u.id] || u.leetcodeSolved || 0, streak: u.streak, cfRating: u.cfRating, score: u.xp, college: u.college, isMe: req.user?.id === u.id }));
    let myRank = null;
    if (req.user) {
      const myUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { xp: true, streak: true } });
      const myPos = await prisma.user.count({ where: { xp: { gt: myUser?.xp || 0 }, showOnLeader: true } }) + 1;
      const totalUsers = await prisma.user.count({ where: { showOnLeader: true } });
      const mySolved = await prisma.userProblemStatus.count({ where: { userId: req.user.id, status: 'solved' } });
      myRank = { rank: myPos, totalSolved: mySolved, streak: myUser?.streak || 0, percentile: totalUsers > 0 ? Math.round((1 - myPos / totalUsers) * 100) : 0 };
    }
    res.json({ rankings, myRank, total: await prisma.user.count({ where }) });
  } catch (e) { console.error(e); res.status(500).json({ rankings: [], myRank: null }); }
});

export default router;
