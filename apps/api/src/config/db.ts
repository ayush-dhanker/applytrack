import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  console.log('MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}