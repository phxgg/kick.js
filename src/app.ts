// initialize dotenv
import './env';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import passport from 'passport';

import logger from '@/winston.logger';
import { connectMongo } from '@/db';

import { EventSubscriptionMethod } from './KickAPI/services/EventsService';
import { createWebhookRouter } from './KickAPI/webhooks/WebhookRouter';
import { attachKickClientToReq } from './middleware/attach-kick-client-to-req.middleware';
import { bearerAuthMiddleware } from './middleware/bearer-auth.middleware';
import { validateData } from './middleware/validate-data.middleware';
import { createOAuthRouter } from './routers/oauth.router';
import { initKickPassportOAuthStrategy } from './strategies/kick.strategy';
import { testValidator } from './validators/test.validator';

morgan.token('remote-user', (req: any) => {
  return req.user ? req.user.email : 'guest';
});

const app = express();
// If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express:
// app.set('trust proxy', 1);
app.use(
  morgan(
    // apache like format string
    // do not include `[:date[clf]]` since timestamp is logged by winston
    ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" ":user-agent"',
    {
      stream: {
        write: (message) => {
          logger.info(message.trim(), { label: 'HTTP' });
        },
      },
      skip: (req, res) => {
        return req.method === 'OPTIONS';
      },
    }
  )
);
app.use(helmet());
app.use(cors());
app.use(
  express.json({
    // Attach rawBody to request if we're handling webhooks
    verify: (req, res, buf) => {
      if (req.url.startsWith('/webhooks')) {
        (req as any).rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET!));
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // set true behind HTTPS/proxy
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);
app.use(compression());

// Initialize Passport OAuth2 strategy for Kick
initKickPassportOAuthStrategy();

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize certain routes before middleware
app.use('/webhooks', createWebhookRouter()); // kick webhooks
app.use('/oauth', createOAuthRouter());

/**
 * DEBUG
 * These endpoints are meant for debugging purposes only.
 */
app.post('/test', bearerAuthMiddleware, validateData(testValidator), attachKickClientToReq, async (req, res) => {
  res.json({ message: 'Data is valid', data: req.body });
});

app.get('/events', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(StatusCodes.FORBIDDEN);
  }
  const events = await req.kick.events.fetch();
  res.json(events);
});

app.get('/subscribe', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(StatusCodes.FORBIDDEN);
  }
  const me = await req.kick.users.me();
  const subscription = await req.kick.events.subscribe({
    broadcasterUserId: me.userId,
    event: { name: 'chat.message.sent', version: 1 },
    method: EventSubscriptionMethod.WEBHOOK,
  });
  if (subscription.error) {
    logger.error(`Failed to subscribe to event ${subscription.name} - ERROR_MSG: ${subscription.error}`);
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  logger.info(subscription);
  return res.json(subscription);
});

app.get('/delete', bearerAuthMiddleware, attachKickClientToReq, async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(StatusCodes.FORBIDDEN);
  }
  const subscriptions = await req.kick.events.fetch();
  await req.kick.events.unsubscribeMultiple(subscriptions.map((sub) => sub.id));
  res.sendStatus(StatusCodes.NO_CONTENT);
});
/**
 * END DEBUG
 */

// Connect to MongoDB
// Start only after DB connect (optional: remove await to start immediately)
(async () => {
  try {
    await connectMongo();
    app.listen(3000, () => {
      logger.info('Server started on http://localhost:3000');
    });
  } catch (err) {
    logger.error('Failed to start server (DB connect failed)', { error: err });
    process.exit(1);
  }
})();

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig as NodeJS.Signals, async () => {
    logger.info(`Received ${sig}, shutting down...`);
    try {
      (await import('./db')).disconnectMongo();
    } finally {
      process.exit(0);
    }
  })
);
