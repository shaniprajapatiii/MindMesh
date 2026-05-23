import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { mongoDb } from '../lib/db';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
    const user = await mongoDb.user.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, role: true } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;
    }
  } catch {}
  next();
};

export const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};
