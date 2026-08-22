import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './token.service.js';
import type { RegisterInput, LoginInput, PublicUser } from '@applytrack/shared';

const BCRYPT_COST = 12;

const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO1TnQ0MvnHkkYbLQXNoIhKZL5nCwbQyi';

type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await UserModel.findOne({ email: input.email }).lean();
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 409, 'That email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return buildAuthResult(
    user.id as string,
    user.name,
    user.email,
    user.tokenVersion,
  );
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email }).select(
    '+passwordHash',
  );

  if (!user) {
    await bcrypt.compare(input.password, DUMMY_HASH);
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }

  return buildAuthResult(
    user.id as string,
    user.name,
    user.email,
    user.tokenVersion,
  );
}

export async function refreshSession(token: string): Promise<AuthResult> {
  const payload = verifyRefreshToken(token);

  const user = await UserModel.findById(payload.sub);
  if (!user) {
    throw new AppError('INVALID_REFRESH', 401, 'Session is no longer valid');
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    throw new AppError('INVALID_REFRESH', 401, 'Session has been revoked');
  }

  return buildAuthResult(
    user.id as string,
    user.name,
    user.email,
    user.tokenVersion,
  );
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found');
  }
  return { id: String(user._id), name: user.name, email: user.email };
}

function buildAuthResult(
  id: string,
  name: string,
  email: string,
  tokenVersion: number,
): AuthResult {
  return {
    user: { id, name, email },
    accessToken: signAccessToken(id),
    refreshToken: signRefreshToken(id, tokenVersion),
  };
}