import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError('UNAUTHORIZED', 401, 'Missing access token'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    next(error);
  }
}