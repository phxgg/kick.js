// initialize dotenv
import './env';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';

import logger from '@/winston.logger';
import { connectMongo } from '@/db';

import { ensureKickClient } from './middleware/ensure-kick-client.middleware';
import { initKickPassportOAuth } from './passport/kick.passport';
import { createOAuthRouter } from './routers/oauth.router';

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
initKickPassportOAuth();

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure Kick client is attached to request
app.use(ensureKickClient);

// Routes
app.use('/oauth', createOAuthRouter());

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
