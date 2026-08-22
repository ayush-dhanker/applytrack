import type { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  revokeAllSessions,
  getCurrentUser,
} from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'rt';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await registerUser(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ user: result.user, accessToken: result.accessToken });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginUser(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (typeof token !== 'string') {
    throw new AppError('INVALID_REFRESH', 401, 'No refresh token');
  }

  const result = await refreshSession(token);
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function logoutAll(req: Request, res: Response): Promise<void> {
  await revokeAllSessions(req.userId as string);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await getCurrentUser(req.userId as string);
  res.json({ user });
}