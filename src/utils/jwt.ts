import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

export type JwtPayload = { sub: string };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION! as StringValue,
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION! as StringValue,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
}
