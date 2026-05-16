import z from 'zod';

export const envValidator = z.object({
  MONGODB_URI: z.string().min(1),

  KICK_AUTH_URL: z.url().min(1),
  KICK_TOKEN_URL: z.url().min(1),
  KICK_CLIENT_ID: z.string().min(1),
  KICK_CLIENT_SECRET: z.string().min(1),
  KICK_CALLBACK_URL: z.url().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRATION: z.string().min(1),

  SESSION_SECRET: z.string().min(1),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export type EnvSchema = z.infer<typeof envValidator>;
