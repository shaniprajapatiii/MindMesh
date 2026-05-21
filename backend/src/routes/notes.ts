import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user!.id },
      include: { tags: true },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    res.json(notes.map(n => ({ ...n, tags: n.tags.map(t => t.tag) })));
  } catch (e) { res.status(500).json({ message: 'Failed to fetch notes' }); }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, mode = 'simple', pinned = false, tags = [], problemId, problemTitle } = req.body;
    const note = await prisma.note.create({
      data: {
        userId: req.user!.id, title, content, mode, pinned, problemId, problemTitle,
        tags: { create: (tags as string[]).map(t => ({ tag: t })) },
      },
      include: { tags: true },
    });
    res.json({ ...note, tags: note.tags.map(t => t.tag) });
  } catch { res.status(500).json({ message: 'Failed to create note' }); }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, mode, pinned, tags = [], problemId, problemTitle } = req.body;
    await prisma.noteTag.deleteMany({ where: { noteId: req.params.id } });
    const note = await prisma.note.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { title, content, mode, pinned, problemId, problemTitle, tags: { create: (tags as string[]).map(t => ({ tag: t })) } },
      include: { tags: true },
    });
    res.json({ ...note, tags: note.tags.map(t => t.tag) });
  } catch { res.status(500).json({ message: 'Failed to update note' }); }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ deleted: true });
  } catch { res.status(500).json({ message: 'Failed to delete note' }); }
});

export default router;
