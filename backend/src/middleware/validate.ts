import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return res.status(400).json({ message: e.errors[0].message, errors: e.errors });
    }
    next(e);
  }
};
