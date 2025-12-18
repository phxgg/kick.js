import mongoose from 'mongoose';

import { createLogger } from '@/winston.logger';

const logger = createLogger('MongoDB');

let connection: Promise<typeof mongoose> | null = null;

export function connectMongo(uri = process.env.MONGODB_URI!) {
  if (!uri) throw new Error('MONGODB_URI not set');
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose); // already connected
  if (connection) return connection;

  mongoose.connection.on('connected', () => logger.info('Connected'));
  mongoose.connection.on('error', (err) => logger.error('Error', err));
  mongoose.connection.on('disconnected', () => logger.warn('Disconnected'));

  connection = mongoose.connect(uri).finally(() => {
    connection = null;
  });
  return connection;
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
