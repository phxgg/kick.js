import jwt from 'jsonwebtoken';

export type JwtPayload = { userId: string };

export function signAccessToken(userId: string) {
  return jwt.sign({ userId } as JwtPayload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId } as JwtPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JwtPayload;
}
