import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ms, { type StringValue } from 'ms';
import { ulid } from 'ulid';

import { TokenType } from '@/models/Token';
import { jwtService, type JwtPayload } from '@/services/jwt.service';
import { type RevokeTokenSchema } from '@/validators/revoke-token.validator';

class OAuthController {
  async kickCallback(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const jtiAccess = ulid();
    const jtiRefresh = ulid();

    const accessToken = jwtService.signAccessToken({ sub: userId, jti: jtiAccess });
    const refreshToken = jwtService.signRefreshToken({ sub: userId, jti: jtiRefresh });

    const accessMs = ms(process.env.JWT_ACCESS_EXPIRATION! as StringValue);
    const refreshMs = ms(process.env.JWT_REFRESH_EXPIRATION! as StringValue);

    await Promise.all([
      jwtService.recordToken({
        jti: jtiAccess,
        type: TokenType.ACCESS_TOKEN,
        provider: 'kick',
        user: userId,
        expiresAt: new Date(Date.now() + accessMs),
      }),
      jwtService.recordToken({
        jti: jtiRefresh,
        type: TokenType.REFRESH_TOKEN,
        provider: 'kick',
        user: userId,
        expiresAt: new Date(Date.now() + refreshMs),
      }),
    ]);

    return res.json({
      accessToken,
      refreshToken,
      expiresIn: Math.floor(accessMs / 1000),
    });
  }

  async revokeToken(req: Request, res: Response) {
    const { token, type, reason } = req.body as RevokeTokenSchema;

    let payload: JwtPayload | null = null;
    let resolvedType: TokenType | undefined = type;

    try {
      if (resolvedType === TokenType.ACCESS_TOKEN) {
        payload = jwtService.verifyAccessToken(token);
      } else if (resolvedType === TokenType.REFRESH_TOKEN) {
        payload = jwtService.verifyRefreshToken(token);
      } else {
        // Try both if type not provided
        try {
          payload = jwtService.verifyAccessToken(token);
          resolvedType = TokenType.ACCESS_TOKEN;
        } catch {
          payload = jwtService.verifyRefreshToken(token);
          resolvedType = TokenType.REFRESH_TOKEN;
        }
      }
    } catch {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid_token' });
    }

    await jwtService.revokeJti(payload!.jti, reason);
    return res.json({ revoked: true, type: resolvedType });
  }

  async revokeAllUserTokens(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    try {
      const revokedAccess = await jwtService.revokeAllForUser({
        userId,
        type: TokenType.ACCESS_TOKEN,
      });
      const revokedRefresh = await jwtService.revokeAllForUser({
        userId,
        type: TokenType.REFRESH_TOKEN,
      });
      return res.json({ revokedAccess, revokedRefresh });
    } catch {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'internal_server_error' });
    }
  }
}

export const oauthController = new OAuthController();
