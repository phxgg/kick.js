import z from 'zod';

export const envValidator = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  KICK_AUTH_URL: z.url().min(1, 'KICK_AUTH_URL is required'),
  KICK_TOKEN_URL: z.url().min(1, 'KICK_TOKEN_URL is required'),
  KICK_CLIENT_ID: z.string().min(1, 'KICK_CLIENT_ID is required'),
  KICK_CLIENT_SECRET: z.string().min(1, 'KICK_CLIENT_SECRET is required'),
  KICK_CALLBACK_URL: z.url().min(1, 'KICK_CALLBACK_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRATION: z.string().min(1, 'JWT_ACCESS_EXPIRATION is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRATION: z.string().min(1, 'JWT_REFRESH_EXPIRATION is required'),

  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export type EnvSchema = z.infer<typeof envValidator>;
