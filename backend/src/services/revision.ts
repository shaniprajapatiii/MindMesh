import { mongoDb } from '../lib/db';

export async function computeWeakTopics(userId: string, maxTopics = 5) {
  const submissions = await mongoDb.submission.findMany({ where: { userId }, include: { problem: { select: { topic: true, id: true } } }, take: 1000 });
  const statuses = await mongoDb.userProblemStatus.findMany({ where: { userId }, include: { problem: { select: { topic: true, id: true } } } });

  const solvedSet = new Set(statuses.filter((s: any) => s.status === 'solved').map((s: any) => s.problemId));

  const topicStats: Record<string, { attempts: number; solved: number; problems: Set<string> }> = {};

  for (const s of submissions) {
    const topic = s.problem?.topic || 'General';
    topicStats[topic] = topicStats[topic] || { attempts: 0, solved: 0, problems: new Set() };
    if (s.verdict === 'accepted' || s.status === 'accepted' || s.status === 'Ok' || s.status === 'OK') {
      topicStats[topic].solved += 1;
      if (s.problem?.id) topicStats[topic].problems.add(String(s.problem.id));
    } else {
      topicStats[topic].attempts += 1;
      if (s.problem?.id) topicStats[topic].problems.add(String(s.problem.id));
    }
  }

  for (const st of statuses) {
    const topic = st.problem?.topic || 'General';
    topicStats[topic] = topicStats[topic] || { attempts: 0, solved: 0, problems: new Set() };
    if (st.status === 'solved') {
      topicStats[topic].solved += 1;
      if (st.problemId) topicStats[topic].problems.add(String(st.problemId));
    }
  }

  const scored = Object.entries(topicStats).map(([topic, stats]) => ({ topic, score: stats.attempts - stats.solved, attempts: stats.attempts, solved: stats.solved }));
  scored.sort((a, b) => b.score - a.score || b.attempts - a.attempts);
  return scored.slice(0, maxTopics).map(s => s.topic);
}

export async function queueRevisionForUser(userId: string, maxPerTopic = 5) {
  const topics = await computeWeakTopics(userId, 5);
  if (!topics || topics.length === 0) return [];

  const statuses = await mongoDb.userProblemStatus.findMany({ where: { userId } });
  const solvedSet = new Set(statuses.filter((s: any) => s.status === 'solved').map((s: any) => s.problemId));

  const created: any[] = [];
  for (const topic of topics) {
    const problems = await mongoDb.problem.findMany({ where: { topic }, take: 20 });
    let added = 0;
    for (const p of problems) {
      if (added >= maxPerTopic) break;
      if (solvedSet.has(p.id)) continue;
      const exists = await mongoDb.revisionQueue.findFirst({ where: { userId, problemId: p.id } });
      if (exists) continue;
      const rec = await mongoDb.revisionQueue.create({ data: { userId, problemId: p.id, problemTitle: p.title || p.id, topic: p.topic || topic, reason: 'weak-topic', priority: 1, scheduledAt: new Date(), createdAt: new Date(), read: false } });
      created.push(rec);
      added += 1;
    }
  }
  return created;
}

export async function listRevisionQueue(userId: string) {
  return mongoDb.revisionQueue.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
