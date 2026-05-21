import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BADGE_CHECKS = [
  { id: 'first_solve', condition: async (uid: string) => await prisma.userProblemStatus.count({ where: { userId: uid, status: 'solved' } }) >= 1 },
  { id: 'streak_7', condition: async (uid: string) => ((await prisma.user.findUnique({ where: { id: uid }, select: { maxStreak: true } }))?.maxStreak || 0) >= 7 },
  { id: 'streak_30', condition: async (uid: string) => ((await prisma.user.findUnique({ where: { id: uid }, select: { maxStreak: true } }))?.maxStreak || 0) >= 30 },
  { id: 'hundred_solved', condition: async (uid: string) => await prisma.userProblemStatus.count({ where: { userId: uid, status: 'solved' } }) >= 100 },
  { id: 'hard_5', condition: async (uid: string) => await prisma.userProblemStatus.count({ where: { userId: uid, status: 'solved', problem: { difficulty: 'Hard' } } }) >= 5 },
  { id: 'dp_master', condition: async (uid: string) => await prisma.userProblemStatus.count({ where: { userId: uid, status: 'solved', problem: { topic: 'DP' } } }) >= 20 },
  { id: 'cf_1200', condition: async (uid: string) => ((await prisma.user.findUnique({ where: { id: uid }, select: { cfRating: true } }))?.cfRating || 0) >= 1200 },
  { id: 'graph_king', condition: async (uid: string) => await prisma.userProblemStatus.count({ where: { userId: uid, status: 'solved', problem: { topic: 'Graph' } } }) >= 15 },
];

export async function checkAndGrantBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];
  const existing = new Set((await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map(b => b.badgeId));
  for (const badge of BADGE_CHECKS) {
    if (existing.has(badge.id)) continue;
    try {
      if (await badge.condition(userId)) {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
        newBadges.push(badge.id);
      }
    } catch {}
  }
  return newBadges;
}

export function calculateLevel(xp: number): number {
  let level = 1, threshold = 100, inc = 200;
  while (xp >= threshold) { level++; threshold += inc; inc += 100; }
  return level;
}

export function getXpForAction(action: string, difficulty?: string): number {
  if (action === 'solve') {
    if (difficulty === 'Easy') return 10;
    if (difficulty === 'Medium') return 25;
    if (difficulty === 'Hard') return 50;
  }
  const map: Record<string, number> = { daily_streak: 5, create_note: 3, sheet_complete: 100 };
  return map[action] || 5;
}

export async function grantXp(userId: string, xp: number) {
  const updated = await prisma.user.update({ where: { id: userId }, data: { xp: { increment: xp } }, select: { xp: true } });
  const newLevel = calculateLevel(updated.xp);
  await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
}
