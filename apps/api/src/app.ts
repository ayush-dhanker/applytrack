import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    db: connected ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});