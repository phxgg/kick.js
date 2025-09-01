// initialize dotenv
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { KickClient } from '@/KickAPI/Client';

const app = express();
app.use(express.json());

// Initialize Kick Client
const client = new KickClient(process.env.KICK_CLIENT_ID, process.env.KICK_CLIENT_SECRET);

app.use('/callback', async (req, res) => {
  // Handle OAuth callback
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing code');
  }

  client.oauth
    .exchangeToken(code as string)
    .then((tokenResponse) => {
      client.token = tokenResponse;
      console.log('Access Token:', tokenResponse.access_token);
      res.send('Authorization successful');
    })
    .catch((error) => {
      console.error('Error exchanging token:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.use('/send', async (req, res) => {
  const channel = await client.channels.fetchBySlug('phxgg');
  console.log('Channel:', channel);

  channel
    .send('Hello, world!')
    .then((message) => {
      console.log('Message sent:', message);
      return res.send('Message sent');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      return res.status(500).send('Internal Server Error');
    });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

async function bootstrapKickBot() {
  try {
    await client.initialize();
  } catch (err) {
    console.error('Error bootstrapping application:', err);
  }

  console.log(await client.oauth.generateAuthorizeURL());
}

bootstrapKickBot();
