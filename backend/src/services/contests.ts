import { mongoDb } from '../lib/db';
import { sendContestReminderEmail } from './email';

export type ContestFeedItem = {
  id: string;
  platform: string;
  name: string;
  startTime: string;
  duration: string;
  url: string;
};

export type ContestReminderStage = '24h' | '1h';

export type ContestReminderRecord = ContestFeedItem & {
  stage: ContestReminderStage;
  title: string;
  message: string;
};

export type ContestReminderUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  notifContest?: boolean | null;
  notifEmail?: boolean | null;
};

export async function fetchUpcomingContests(): Promise<ContestFeedItem[]> {
  const contests: ContestFeedItem[] = [];

  try {
    const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
    if (response.ok) {
      const payload: any = await response.json();
      const upcoming = payload?.result?.filter((contest: any) => contest.phase === 'BEFORE').slice(0, 5) || [];
      upcoming.forEach((contest: any) => {
        contests.push({
          id: `cf-${contest.id}`,
          platform: 'Codeforces',
          name: contest.name,
          startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
          duration: `${Math.round(contest.durationSeconds / 3600)}h`,
          url: `https://codeforces.com/contest/${contest.id}`,
        });
      });
    }
  } catch {
    // Keep the feed resilient when Codeforces is unavailable.
  }

  const now = new Date();
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
  nextSaturday.setHours(10, 30, 0, 0);

  contests.push({
    id: 'lc-weekly',
    platform: 'LeetCode',
    name: 'Weekly Contest',
    startTime: nextSaturday.toISOString(),
    duration: '1.5h',
    url: 'https://leetcode.com/contest/',
  });

  return contests.sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
}

export function getContestReminderStage(startTime: string, now = Date.now()): ContestReminderStage | null {
  const remaining = new Date(startTime).getTime() - now;
  if (remaining <= 0) return null;
  if (remaining <= 60 * 60 * 1000) return '1h';
  if (remaining <= 24 * 60 * 60 * 1000) return '24h';
  return null;
}

export function buildContestReminder(contest: ContestFeedItem, stage: ContestReminderStage): ContestReminderRecord {
  const title = stage === '1h' ? 'Contest starting soon' : 'Contest tomorrow';
  const message = stage === '1h'
    ? `${contest.platform}: ${contest.name} starts in under 1 hour`
    : `${contest.platform}: ${contest.name} starts within 24 hours`;

  return {
    ...contest,
    stage,
    title,
    message,
  };
}

export async function queueContestRemindersForUser(
  user: ContestReminderUser,
  contests?: ContestFeedItem[],
  options: { sendEmail?: boolean } = {},
) {
  if (user.notifContest === false) return [];

  const contestList = contests || await fetchUpcomingContests();
  const created: any[] = [];

  for (const contest of contestList) {
    const stage = getContestReminderStage(contest.startTime);
    if (!stage) continue;

    const dedupeKey = `${contest.id}:${stage}`;
    const existing = await mongoDb.contestReminder.findFirst({ where: { userId: user.id, dedupeKey } });
    if (existing) continue;

    const reminder = buildContestReminder(contest, stage);
    const record = await mongoDb.contestReminder.create({
      data: {
        userId: user.id,
        dedupeKey,
        stage,
        type: 'contest',
        title: reminder.title,
        message: reminder.message,
        read: false,
        createdAt: new Date(),
        platform: reminder.platform,
        name: reminder.name,
        startTime: reminder.startTime,
        duration: reminder.duration,
        url: reminder.url,
      },
    });
    created.push(record);

    if (options.sendEmail && user.notifEmail && user.email) {
      try {
        await sendContestReminderEmail(user.email, user.name || 'there', reminder);
      } catch {
        // Email delivery is best-effort.
      }
    }
  }

  return created;
}
