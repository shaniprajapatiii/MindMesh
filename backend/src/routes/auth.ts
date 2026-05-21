import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const router = Router();

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpCode.create({ data: { email, code: otp, expiresAt } });

    await mailer.sendMail({
      from: `DSATracker <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your DSATracker OTP Code',
      html: `
        <div style="font-family:system-ui;max-width:400px;margin:0 auto;padding:24px;background:#0a0a0f;color:#f0f0f8;border-radius:12px">
          <h2 style="color:#6366f1;margin-bottom:8px">DSATracker</h2>
          <p>Your verification code:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6366f1;margin:16px 0">${otp}</div>
          <p style="color:#6b7280;font-size:14px">Valid for 10 minutes. Do not share this code.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const record = await prisma.otpCode.findFirst({
      where: { email, code: otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
    res.json({ verified: true });
  } catch {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
      password: z.string().min(8),
      leetcodeId: z.string().optional(),
      codeforcesId: z.string().optional(),
      codechefId: z.string().optional(),
      gfgId: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const exists = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { username: data.username }] } });
    if (exists) return res.status(400).json({ message: exists.email === data.email ? 'Email already registered' : 'Username taken' });

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name, email: data.email, username: data.username.toLowerCase(),
        password: hashedPassword, isEmailVerified: true,
        leetcodeId: data.leetcodeId, codeforcesId: data.codeforcesId,
        codechefId: data.codechefId, gfgId: data.gfgId,
      },
      select: { id: true, email: true, username: true, name: true, role: true },
    });

    const token = generateToken(user.id, user.email, user.role);
    res.status(201).json({ user, token });
  } catch (e: any) {
    if (e.name === 'ZodError') return res.status(400).json({ message: e.errors[0].message });
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, user.email, user.role);
    res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name }, token });
  } catch {
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true, username: true, avatar: true, role: true, streak: true, xp: true, level: true } });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;
