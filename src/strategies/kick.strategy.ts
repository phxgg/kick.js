import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';

import { KICK_BASE_URL } from '@/KickAPI/KickClient';
import { FetchUserResponse } from '@/KickAPI/services/UsersService';
import { AccountModel } from '@/models/Account';
import { UserModel } from '@/models/User';

const scopes = ['user:read', 'channel:read', 'channel:write', 'chat:write', 'events:subscribe', 'moderation:ban'];

export function initKickPassportOAuthStrategy() {
  passport.use(
    'kick',
    new OAuth2Strategy(
      {
        authorizationURL: process.env.KICK_AUTH_URL,
        tokenURL: process.env.KICK_TOKEN_URL,
        clientID: process.env.KICK_CLIENT_ID,
        clientSecret: process.env.KICK_CLIENT_SECRET,
        callbackURL: process.env.KICK_CALLBACK_URL,
        scope: scopes.join(' '),
        state: true,
        pkce: true,
        passReqToCallback: true,
      },
      async function (req, accessToken, refreshToken, params, profile, done) {
        try {
          // Fetch user information from Kick API
          const res = await fetch(`${KICK_BASE_URL}/users`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const json = (await res.json()) as FetchUserResponse;
          const kickUser = json.data[0];

          // Upsert local User
          const userDoc = await UserModel.findOneAndUpdate(
            { kickUserId: String(kickUser.user_id) },
            {
              kickUserId: String(kickUser.user_id),
              name: kickUser.name,
              email: kickUser.email,
              image: kickUser.profile_picture,
            },
            { new: true, upsert: true }
          );

          // Upsert Account
          await AccountModel.findOneAndUpdate(
            { provider: 'kick', providerAccountId: String(kickUser.user_id) },
            {
              userId: userDoc._id,
              provider: 'kick',
              providerAccountId: String(kickUser.user_id),
              accessToken,
              refreshToken,
              tokenType: params.token_type,
              scope: params.scope ? params.scope.split(' ') : null,
              expiresAt: new Date(Date.now() + params.expires_in * 1000),
            },
            { upsert: true, new: true }
          );

          done(null, userDoc);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export default initKickPassportOAuthStrategy;
