// initialize dotenv
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import logger from './winston.logger';
import { initKickPassportOAuth } from './passport/kick.passport';
import { createOAuthRouter } from './routers/oauth.router';
import { KickClient } from './KickAPI/Client';
import { attachKickClientToReq } from './middleware/attach-kick-client-to-req.middleware';

morgan.token('remote-user', (req: any) => {
  return req.user ? req.user.email : 'guest';
});

const client = new KickClient(process.env.KICK_CLIENT_ID, process.env.KICK_CLIENT_SECRET);

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
    },
  ),
);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true behind HTTPS/proxy
      httpOnly: true,
      sameSite: 'lax',
    },
  }),
);
app.use(cookieParser());
app.use(compression());

// Initialize Passport OAuth2 strategy for Kick
initKickPassportOAuth(client);

// Connect to MongoDB
// const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kickjs';
// mongoose
//   .connect(mongoUri)
//   .then(() => console.log('[MongoDB] connected'))
//   .catch((err) => console.error('[MongoDB] connection error', err));

// Initialize Passport (JWT strategy)
app.use(passport.initialize());
app.use(passport.session());

app.use(attachKickClientToReq(client));

// Routes
app.use('/oauth', createOAuthRouter());

// Start the API server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// async function bootstrapKickBot() {
//   try {
//     await client.initialize();
//   } catch (err) {
//     console.error('Error bootstrapping application:', err);
//   }

//   console.log(await client.oauth.generateAuthorizeURL());
// }

// bootstrapKickBot();
