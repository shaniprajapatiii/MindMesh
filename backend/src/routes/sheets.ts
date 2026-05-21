import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_: Request, res: Response) => {
  try {
    const sheets = await prisma.dSASheet.findMany({
      where: { isPublic: true },
      include: { _count: { select: { items: true } } },
    });
    res.json(sheets.map(s => ({ ...s, total: s._count.items })));
  } catch { res.status(500).json([]); }
});

router.get('/progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.sheetProgress.groupBy({
      by: ['sheetId'],
      where: { userId: req.user!.id, solved: true },
      _count: true,
    });
    res.json(Object.fromEntries(progress.map(p => [p.sheetId, p._count])));
  } catch { res.status(500).json({}); }
});

router.get('/:id/problems', optionalAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.sheetItem.findMany({
      where: { sheetId: req.params.id },
      include: { problem: true },
      orderBy: { order: 'asc' },
    });

    let result: any[] = items.map(i => ({
      ...i.problem, topic: i.topic || i.problem.topic,
      order: i.order, sheetItemId: i.id, solved: false,
    }));

    if (req.user) {
      const progress = await prisma.sheetProgress.findMany({
        where: { userId: req.user.id, sheetId: req.params.id },
      });
      const solvedSet = new Set(progress.filter(p => p.solved).map(p => p.problemId));
      result = result.map(p => ({ ...p, solved: solvedSet.has(p.id) }));
    }

    res.json(result);
  } catch { res.status(500).json([]); }
});

router.post('/toggle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, sheetId } = req.body;
    const existing = await prisma.sheetProgress.findUnique({
      where: { userId_sheetId_problemId: { userId: req.user!.id, sheetId, problemId } },
    });
    const record = await prisma.sheetProgress.upsert({
      where: { userId_sheetId_problemId: { userId: req.user!.id, sheetId, problemId } },
      update: { solved: !existing?.solved, solvedAt: !existing?.solved ? new Date() : null },
      create: { userId: req.user!.id, sheetId, problemId, solved: true, solvedAt: new Date() },
    });
    res.json(record);
  } catch { res.status(500).json({ message: 'Failed' }); }
});

// Create custom sheet
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, emoji, isPublic = false } = req.body;
    const sheet = await prisma.dSASheet.create({
      data: { name, description, emoji, isPublic, author: 'Custom', createdBy: req.user!.id },
    });
    res.status(201).json(sheet);
  } catch { res.status(500).json({ message: 'Failed to create sheet' }); }
});

export default router;
