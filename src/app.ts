// initialize dotenv
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import { initKickAuth } from './passport/kick';
import oauthRoutes from './routes/oauth';
import { KickClient } from './KickAPI/Client';

const client = new KickClient(process.env.KICK_CLIENT_ID, process.env.KICK_CLIENT_SECRET);

const app = express();
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

// Initialize Passport OAuth2 strategy for Kick
initKickAuth(client);

// Connect to MongoDB
// const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kickjs';
// mongoose
//   .connect(mongoUri)
//   .then(() => console.log('[MongoDB] connected'))
//   .catch((err) => console.error('[MongoDB] connection error', err));

// Initialize Passport (JWT strategy)
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/oauth', oauthRoutes);

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
