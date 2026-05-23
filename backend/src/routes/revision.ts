import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { listRevisionQueue } from '../services/revision';
import { mongoDb } from '../lib/db';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await listRevisionQueue(req.user!.id);
    res.json(items);
  } catch (e) {
    console.error('Failed to list revision queue', e);
    res.status(500).json([]);
  }
});

router.post('/:id/done', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const item = await mongoDb.revisionQueue.findFirst({ where: { id, userId: req.user!.id } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await mongoDb.revisionQueue.delete({ where: { id: item.id } });
    res.json({ success: true });
  } catch (e) {
    console.error('Failed to mark revision done', e);
    res.status(500).json({ success: false });
  }
});

export default router;
