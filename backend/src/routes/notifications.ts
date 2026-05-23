import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { mongoDb } from '../lib/db';
import { queueContestRemindersForUser } from '../services/contests';

const router = Router();

type NotificationRecord = {
  id: string;
  type: 'badge' | 'streak' | 'ai' | 'system' | 'contest';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  platform?: string;
  name?: string;
  startTime?: string;
  duration?: string;
  url?: string;
};

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [submissions, notes, badges, activities, profile] = await Promise.all([
      mongoDb.submission.findMany({
        where: { userId },
        include: { problem: { select: { title: true, platform: true } } },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      mongoDb.note.findMany({
        where: { userId },
        select: { id: true, title: true, problemTitle: true, mode: true, updatedAt: true, createdAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      }),
      mongoDb.userBadge.findMany({
        where: { userId },
        select: { id: true, badgeId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      mongoDb.activityLog.findMany({
        where: { userId },
        select: { dateStr: true, count: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      mongoDb.user.findUnique({
        where: { id: userId },
        select: { streak: true, maxStreak: true, xp: true, level: true },
      }),
    ]);
    const user = await mongoDb.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, notifContest: true, notifEmail: true },
    });

    if (user?.notifContest) {
      await queueContestRemindersForUser(
        { id: userId, name: user.name, email: user.email, notifContest: user.notifContest, notifEmail: user.notifEmail },
        undefined,
        { sendEmail: false },
      );
    }

    const contestReminders = await mongoDb.contestReminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const items: NotificationRecord[] = [
      ...submissions.map((submission: any) => ({
        id: `submission-${submission.id}`,
        type: (submission.status === 'accepted' ? 'system' : 'ai') as NotificationRecord['type'],
        title: submission.status === 'accepted' ? 'Problem solved' : 'Submission needs work',
        message: `${submission.problem?.title || 'A problem'} on ${submission.problem?.platform || 'a platform'} was ${submission.status.replace(/_/g, ' ')}`,
        read: true,
        createdAt: submission.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      ...notes.map((note: any) => ({
        id: `note-${note.id}`,
        type: 'ai' as NotificationRecord['type'],
        title: note.mode === 'markdown' ? 'Markdown note updated' : 'Note updated',
        message: `${note.title}${note.problemTitle ? ` linked to ${note.problemTitle}` : ''}`,
        read: true,
        createdAt: note.updatedAt?.toISOString?.() || note.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      ...badges.map((badge: any) => ({
        id: `badge-${badge.id}`,
        type: 'badge' as NotificationRecord['type'],
        title: 'Badge earned',
        message: `Badge ${badge.badgeId} was awarded from your live progress`,
        read: true,
        createdAt: badge.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      ...activities.map((activity: any) => ({
        id: `activity-${activity.dateStr}`,
        type: 'streak' as NotificationRecord['type'],
        title: 'Daily activity logged',
        message: `${activity.count} problems solved on ${activity.dateStr}`,
        read: true,
        createdAt: activity.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      ...(profile ? [{
        id: 'profile-snapshot',
        type: 'system' as NotificationRecord['type'],
        title: 'Profile snapshot',
        message: `Current streak ${profile.streak || 0}, best streak ${profile.maxStreak || 0}, level ${profile.level || 1}, xp ${profile.xp || 0}`,
        read: true,
        createdAt: new Date().toISOString(),
      }] : []),
      ...contestReminders.map((reminder: any) => ({
        id: reminder.dedupeKey || reminder.id,
        type: 'contest' as NotificationRecord['type'],
        title: reminder.title,
        message: reminder.message,
        read: !!reminder.read,
        createdAt: reminder.createdAt?.toISOString?.() || new Date().toISOString(),
        platform: reminder.platform,
        name: reminder.name,
        startTime: reminder.startTime?.toISOString?.() || reminder.startTime,
        duration: reminder.duration,
        url: reminder.url,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json(items);
  } catch (e) {
    console.error('Failed to load notifications', e);
    res.status(500).json([]);
  }
});

router.post('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await mongoDb.contestReminder.updateMany({ where: { userId: req.user!.id }, data: { read: true } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.post('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await mongoDb.contestReminder.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    await mongoDb.contestReminder.update({ where: { id: reminder.id }, data: { read: true } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

export default router;