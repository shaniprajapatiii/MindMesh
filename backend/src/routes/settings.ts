import { Router, Response } from 'express';
import { mongoDb } from '../lib/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await mongoDb.user.findUnique({ where: { id: req.user!.id }, select: { name: true, username: true, email: true, bio: true, location: true, college: true, leetcodeId: true, codeforcesId: true, codechefId: true, gfgId: true, githubId: true, atcoderId: true, editorTheme: true, defaultLanguage: true, fontSize: true, notifDaily: true, notifStreak: true, notifRevision: true, notifContest: true, notifEmail: true, isPublic: true, showOnLeader: true } });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ ...user, notif_daily_reminder: user.notifDaily, notif_streak_alert: user.notifStreak, notif_revision: user.notifRevision, notif_contest: user.notifContest, notif_email: user.notifEmail });
  } catch { res.status(500).json({}); }
});

router.put('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['name','username','bio','location','college','leetcodeId','codeforcesId','codechefId','gfgId','githubId','atcoderId','editorTheme','defaultLanguage','fontSize','isPublic','showOnLeader'];
    const data: Record<string,any> = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.body.notif_daily_reminder !== undefined) data.notifDaily = req.body.notif_daily_reminder;
    if (req.body.notif_streak_alert !== undefined) data.notifStreak = req.body.notif_streak_alert;
    if (req.body.notif_revision !== undefined) data.notifRevision = req.body.notif_revision;
    if (req.body.notif_contest !== undefined) data.notifContest = req.body.notif_contest;
    if (req.body.notif_email !== undefined) data.notifEmail = req.body.notif_email;
    await mongoDb.user.update({ where: { id: req.user!.id }, data });
    res.json({ success: true });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.delete('/account', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await mongoDb.user.delete({ where: { id: req.user!.id } });
    res.json({ deleted: true });
  } catch { res.status(500).json({ message: 'Failed to delete account' }); }
});

router.get('/export', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [user, notes, statuses, submissions] = await Promise.all([
      mongoDb.user.findUnique({ where: { id: req.user!.id } }),
      mongoDb.note.findMany({ where: { userId: req.user!.id } }),
      mongoDb.userProblemStatus.findMany({ where: { userId: req.user!.id } }),
      mongoDb.submission.findMany({ where: { userId: req.user!.id }, take: 100 }),
    ]);
    res.json({ user, notes, statuses, submissions, exportedAt: new Date() });
  } catch { res.status(500).json({ message: 'Export failed' }); }
});

export default router;
