import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
dotenv.config();

import authRouter from './routes/auth';
import googleAuthRouter from './routes/google-auth';
import problemsRouter from './routes/problems';
import notesRouter from './routes/notes';
import dashboardRouter from './routes/dashboard';
import analyticsRouter from './routes/analytics';
import sheetsRouter from './routes/sheets';
import profileRouter from './routes/profile';
import codeRouter from './routes/code';
import aiRouter from './routes/ai';
import platformsRouter from './routes/platforms';
import leaderboardRouter from './routes/leaderboard';
import communityRouter from './routes/community';
import newsRouter from './routes/news';
import settingsRouter from './routes/settings';
import canvasRouter from './routes/canvas';
import { authLimiter, aiLimiter, syncLimiter } from './middleware/rateLimiter';

export const prisma = new PrismaClient({ log: ['error'] });
const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true } });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', async (_, res) => { try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', ts: new Date() }); } catch { res.status(503).json({ status: 'error' }); } });

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/auth', authLimiter, googleAuthRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/sheets', sheetsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/code', codeRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/platforms', syncLimiter, platformsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/community', communityRouter);
app.use('/api/news', newsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/canvas', canvasRouter);

io.on('connection', (socket) => {
  socket.on('join-room', (id: string) => socket.join(id));
  socket.on('leave-room', (id: string) => socket.leave(id));
  socket.on('canvas-update', (d) => socket.to(d.roomId).emit('canvas-update', d));
  socket.on('code-update', (d) => socket.to(d.roomId).emit('code-update', d));
  socket.on('join-group', (id: string) => socket.join('group-' + id));
  socket.on('group-message', (d) => io.to('group-' + d.groupId).emit('group-message', d));
});

cron.schedule('0 0 * * *', async () => {
  const y = new Date(); y.setDate(y.getDate()-1);
  const yStr = y.toISOString().split('T')[0];
  const tStr = new Date().toISOString().split('T')[0];
  const users = await prisma.user.findMany({ where: { streak: { gt: 0 } }, select: { id: true, lastActiveDate: true } });
  for (const u of users) {
    const last = u.lastActiveDate?.toISOString().split('T')[0];
    if (last !== yStr && last !== tStr) await prisma.user.update({ where: { id: u.id }, data: { streak: 0 } });
  }
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 MindMesh running on http://localhost:${PORT}`));
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
export default app;
