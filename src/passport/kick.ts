import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { KickClient } from '@/KickAPI/Client';

const scopes = ['user:read', 'channel:read', 'channel:write', 'chat:write', 'events:subscribe', 'moderation:ban'];

export function initKickOAuth(client: KickClient) {
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
          client.setToken({
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: params.token_type,
            expires_in: params.expires_in,
            scope: params.scope,
          });
          const user = await client.users.me();
          const plain = user.toJSON();
          done(null, plain);
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}

export default initKickOAuth;
