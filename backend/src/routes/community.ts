import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/posts', optionalAuth as any, async (req: Request, res: Response) => {
  try {
    const { category = 'All', search = '', page = '1' } = req.query as Record<string,string>;
    const where: any = {};
    if (category !== 'All') where.category = category;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }];
    const posts = await prisma.communityPost.findMany({ where, include: { user: { select: { name: true, username: true, avatar: true } }, _count: { select: { likes: true, replies: true } } }, orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], skip: (parseInt(page)-1)*20, take: 20 });
    res.json(posts.map(p => ({ ...p, author: p.user, likes: p._count.likes, replies: p._count.replies, timeAgo: getAgo(p.createdAt) })));
  } catch { res.status(500).json([]); }
});

router.post('/posts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, tags = [] } = req.body;
    const post = await prisma.communityPost.create({ data: { userId: req.user!.id, title, content, category, tags }, include: { user: { select: { name: true, username: true } }, _count: { select: { likes: true, replies: true } } } });
    res.status(201).json({ ...post, author: post.user, likes: 0, replies: 0, timeAgo: 'just now' });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.post('/posts/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId: req.params.id, userId: req.user!.id } } });
    if (existing) { await prisma.postLike.delete({ where: { id: existing.id } }); res.json({ liked: false }); }
    else { await prisma.postLike.create({ data: { postId: req.params.id, userId: req.user!.id } }); res.json({ liked: true }); }
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.post('/posts/:id/reply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reply = await prisma.postReply.create({ data: { postId: req.params.id, userId: req.user!.id, content: req.body.content } });
    res.status(201).json(reply);
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.get('/posts/:id/replies', async (req: Request, res: Response) => {
  try {
    const replies = await prisma.postReply.findMany({ where: { postId: req.params.id }, orderBy: { createdAt: 'asc' } });
    res.json(replies);
  } catch { res.status(500).json([]); }
});

router.get('/groups', optionalAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    const groups = await prisma.studyGroup.findMany({ include: { _count: { select: { members: true } } }, orderBy: { createdAt: 'desc' } });
    const myMemberships = req.user ? await prisma.groupMember.findMany({ where: { userId: req.user.id }, select: { groupId: true } }) : [];
    const mySet = new Set(myMemberships.map(m => m.groupId));
    res.json(groups.map(g => ({ ...g, members: g._count.members, joined: mySet.has(g.id) })));
  } catch { res.status(500).json([]); }
});

router.post('/groups', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, emoji, isPublic = true } = req.body;
    const group = await prisma.studyGroup.create({ data: { name, description, emoji, isPublic, createdBy: req.user!.id, members: { create: { userId: req.user!.id, role: 'admin' } } } });
    res.status(201).json(group);
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.post('/groups/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } }, update: {}, create: { groupId: req.params.id, userId: req.user!.id } });
    res.json({ joined: true });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

router.get('/groups/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await prisma.studyGroup.findUnique({ where: { id: req.params.id }, select: { id: true, isPublic: true } });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } } });
    if (!group.isPublic && !member) return res.status(403).json({ message: 'Join the group to see messages' });

    const messages = await prisma.groupMessage.findMany({
      where: { groupId: req.params.id },
      include: { user: { select: { name: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.json(messages.map(message => ({
      ...message,
      author: message.user,
      timeAgo: getAgo(message.createdAt),
    })));
  } catch {
    res.status(500).json([]);
  }
});

router.post('/groups/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

    const group = await prisma.studyGroup.findUnique({ where: { id: req.params.id }, select: { id: true, isPublic: true } });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } } });
    if (!group.isPublic && !member) return res.status(403).json({ message: 'Join the group to chat' });

    const message = await prisma.groupMessage.create({
      data: { groupId: req.params.id, userId: req.user!.id, content: content.trim() },
      include: { user: { select: { name: true, username: true, avatar: true } } },
    });

    res.status(201).json({
      ...message,
      author: message.user,
      timeAgo: 'just now',
    });
  } catch {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

router.post('/groups/:id/leave', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } } });
    res.json({ left: true });
  } catch { res.status(500).json({ message: 'Failed' }); }
});

function getAgo(d: Date): string {
  const s = Math.floor((Date.now()-d.getTime())/1000);
  if (s<60) return 'just now'; if (s<3600) return `${Math.floor(s/60)}m ago`;
  if (s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
}

export default router;
