import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/db';
import { generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google - handle Google OAuth token
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token, email, name } = req.body;

    let googleEmail = email;
    let googleName = name;
    let googleId = '';

    // Verify Google token if provided
    if (token) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        googleEmail = payload?.email || email;
        googleName = payload?.name || name;
        googleId = payload?.sub || '';
      } catch {
        // Token verification failed, use provided email/name
      }
    }

    if (!googleEmail) return res.status(400).json({ message: 'Email required' });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: googleEmail } });

    if (!user) {
      // Generate unique username from email
      const baseUsername = googleEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await prisma.user.create({
        data: {
          name: googleName || googleEmail.split('@')[0],
          email: googleEmail,
          username,
          isEmailVerified: true,
          // No password for OAuth users
        },
      });
    }

    const jwtToken = generateToken(user.id, user.email, user.role);
    res.json({ user: { id: user.id, email: user.email, name: user.name, username: user.username }, token: jwtToken });
  } catch (e) {
    console.error('Google auth error:', e);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.otpCode.create({ data: { email, code: otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
      // Send email in production
    }
    res.json({ message: 'If the email exists, a reset code has been sent.' });
  } catch {
    res.status(500).json({ message: 'Failed' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await prisma.otpCode.findFirst({
      where: { email, code: otp, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired code' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await Promise.all([
      prisma.user.update({ where: { email }, data: { password: hashedPassword } }),
      prisma.otpCode.update({ where: { id: record.id }, data: { used: true } }),
    ]);
    res.json({ message: 'Password reset successfully' });
  } catch {
    res.status(500).json({ message: 'Reset failed' });
  }
});

export default router;
