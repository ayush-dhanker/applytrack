import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const ACCESS_TOKEN_SECONDS = 15 * 60;          // 15 minutes
const REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type AccessPayload = { sub: string };
export type RefreshPayload = { sub: string; tokenVersion: number };

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_SECONDS,
  });
}

export function signRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, tokenVersion }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new Error('Malformed token');
    }
    return { sub: decoded.sub };
  } catch {
    throw new AppError('INVALID_TOKEN', 401, 'Access token is invalid or expired');
  }
}

export function verifyRefreshToken(token: string): RefreshPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.tokenVersion !== 'number'
    ) {
      throw new Error('Malformed token');
    }
    return { sub: decoded.sub, tokenVersion: decoded.tokenVersion };
  } catch {
    throw new AppError('INVALID_REFRESH', 401, 'Refresh token is invalid or expired');
  }
}