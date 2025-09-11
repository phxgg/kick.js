import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import type { StringValue } from 'ms';

import { TokenModel, TokenType } from '@/models/Token';

export type JwtPayload = { sub: string; jti: string };

class JwtService {
  signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION! as StringValue,
    });
  }

  signRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION! as StringValue,
    });
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  }

  async recordToken(params: {
    jti: string;
    type: TokenType;
    provider: string;
    user?: Types.ObjectId | string;
    expiresAt: Date;
  }) {
    const { jti, type, provider, user, expiresAt } = params;
    await TokenModel.updateOne(
      { jti },
      { $setOnInsert: { jti, createdAt: new Date() }, $set: { type, provider, user, expiresAt } },
      { upsert: true }
    );
  }

  async revokeJti(jti: string, reason?: string) {
    const res = await TokenModel.updateOne({ jti }, { $set: { revokedAt: new Date(), reason } });
    return res.modifiedCount > 0;
  }

  async isRevoked(jti: string) {
    const doc = await TokenModel.findOne({ jti }).select({ revokedAt: 1 }).lean();
    return !!(doc && doc.revokedAt);
  }

  async revokeAllForUser({
    userId,
    provider,
    type,
  }: {
    userId: Types.ObjectId | string;
    provider?: string;
    type?: TokenType;
  }) {
    const filter: Record<string, unknown> = { user: userId, revokedAt: null };
    if (provider) filter.provider = provider;
    if (type) filter.type = type;
    const res = await TokenModel.updateMany(filter, { $set: { revokedAt: new Date(), reason: 'bulk' } });
    return res.modifiedCount;
  }
}

export const jwtService = new JwtService();
