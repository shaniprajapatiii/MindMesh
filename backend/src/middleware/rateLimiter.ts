import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { message: 'Too many auth attempts' } });
export const aiLimiter = rateLimit({ windowMs: 60*60*1000, max: 50, message: { message: 'AI rate limit reached' } });
export const syncLimiter = rateLimit({ windowMs: 60*60*1000, max: 10, message: { message: 'Too many sync requests' } });
export const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
