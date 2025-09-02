import mongoose from 'mongoose';

import logger from '@/winston.logger';

let connecting: Promise<typeof mongoose> | null = null;

export function connectMongo(uri = process.env.MONGODB_URI!) {
  if (!uri) throw new Error('MONGODB_URI not set');
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose); // already connected
  if (connecting) return connecting;

  mongoose.connection.on('connected', () => logger.info('[MongoDB] connected'));
  mongoose.connection.on('error', (err) => logger.error('[MongoDB] error', err));
  mongoose.connection.on('disconnected', () => logger.warn('[MongoDB] disconnected'));

  connecting = mongoose.connect(uri).finally(() => {
    connecting = null;
  });
  return connecting;
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
