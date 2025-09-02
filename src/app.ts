// initialize dotenv
import './env';

import crypto from 'crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import logger from '@/winston.logger';
import { connectMongo } from '@/db';

import { EventSubscriptionMethod } from './KickAPI/services/EventsService';
import { getKickPublicKey } from './KickAPI/services/PublicKeyService';
import { attachKickClientToReq } from './middleware/attach-kick-client-to-req.middleware';
import { createOAuthRouter } from './routers/oauth.router';
import { initKickPassportOAuthStrategy } from './strategies/kick.strategy';

morgan.token('remote-user', (req: any) => {
  return req.user ? req.user.email : 'guest';
});

const app = express();
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use(cookieParser());
app.use(compression());

// Initialize Passport OAuth2 strategy for Kick
initKickPassportOAuthStrategy();

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure Kick client is attached to request
app.use(attachKickClientToReq);

// Kick webhooks
app.post('/webhooks/kick', express.raw({ type: 'application/json' }), async (req, res) => {
  const messageId = req.headers['Kick-Event-Message-Id'];
  const subscriptionId = req.headers['Kick-Event-Subscription-Id'];
  const eventSignature = req.headers['Kick-Event-Signature'];
  const messageTimestamp = req.headers['Kick-Event-Message-Timestamp'];
  const eventType = req.headers['Kick-Event-Type'];
  const eventVersion = req.headers['Kick-Event-Version'];

  const publicKey = await getKickPublicKey();

  const rawBody = req.body.toString('utf8');
  if (!messageId || !messageTimestamp || !rawBody || !eventSignature) {
    logger.error('Missing required parameters for signature verification');
    return res.sendStatus(400);
  }

  const constructSignature = `${messageId}.${messageTimestamp}.${rawBody}`;
  // create an RSA-SHA256 verifier
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(constructSignature);
  const signature = Buffer.from(eventSignature as string, 'base64');
  const isValid = verifier.verify(publicKey, signature);
  if (!isValid) {
    logger.warn('Webhook signature verification failed');
    return res.sendStatus(403);
  }
  logger.info('Received Kick webhook event', { event: rawBody });
  res.sendStatus(200);
});

// Routers
app.use('/oauth', createOAuthRouter());

/**
 * DEBUG
 * These endpoints are meant for debugging purposes only.
 */
app.get('/events', async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(403);
  }
  const events = await req.kick.events.fetch();
  console.log(events);
  res.json(events);
});

app.get('/subscribe', async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(403);
  }
  const me = await req.kick.users.me();
  const subscription = (
    await req.kick.events.subscribe({
      broadcasterUserId: me.userId,
      events: [{ name: 'chat.message.sent', version: 1 }],
      method: EventSubscriptionMethod.WEBHOOK,
    })
  )[0];
  if (subscription.error) {
    logger.error(`Failed to subscribe to event ${subscription.name} - ERROR: ${subscription.error}`);
    return res.sendStatus(500);
  }
  console.log(subscription);
  return res.json(subscription);
});

app.get('/delete', async (req, res) => {
  if (!req.kick) {
    return res.sendStatus(403);
  }
  const subscriptions = await req.kick.events.fetch();
  await req.kick.events.unsubscribe(subscriptions.map((sub) => sub.id));
  res.sendStatus(204);
});

// Connect to MongoDB
// Start only after DB connect (optional: remove await to start immediately)
(async () => {
  try {
    await connectMongo();
    app.listen(3000, () => {
      logger.info('Server started on http://localhost:3000');
    });
  } catch (err) {
    logger.error('Failed to start server (DB connect failed)', err);
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
