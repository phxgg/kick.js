import z from 'zod';

import { TokenType } from '@/models/Token';

export const revokeTokenValidator = z.object({
  token: z.string(),
  type: z.enum(TokenType).optional(),
  reason: z.string().min(1).max(100).optional(),
  provider: z.string().min(1).max(100).optional(),
});

export type RevokeTokenInput = z.infer<typeof revokeTokenValidator>;
