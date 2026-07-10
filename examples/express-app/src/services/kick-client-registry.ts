import { ChatMessageType, KickClient, WebhookEvents } from '@phxgg/kick.js';
import type { ChatMessageSentEventPayload } from '@phxgg/kick.js';

import { createLogger } from '@/winston.logger.js';

import { AccountModel } from '@/models/Account.js';

const logger = createLogger('KickClientRegistry');
const REFRESH_THRESHOLD_MS = 60 * 1000; // refresh if <60s left

/**
 * Keeps one long-lived `KickClient` per user so that `client.on(...)` listeners registered here
 * stay alive across requests and keep reacting to webhook events dispatched by the shared
 * `eventManager` (see webhook.router.ts / dispatchWebhookEvent). Subscribing/unsubscribing to
 * events still goes through the Kick API per request (see web.controller.ts) - this only owns
 * the listener side, e.g. the "reply pong! to !ping" demo.
 */
class KickClientRegistry {
  private clients = new Map<string, KickClient>();

  async get(kickUserId: string): Promise<KickClient> {
    const existing = this.clients.get(kickUserId);
    if (existing) return existing;

    const account = await AccountModel.findOne({ provider: 'kick', providerAccountId: kickUserId });
    if (!account?.accessToken) throw new Error('No linked Kick account for this user');

    const client = new KickClient({
      clientId: process.env.KICK_CLIENT_ID,
      clientSecret: process.env.KICK_CLIENT_SECRET,
      redirectUri: process.env.KICK_CALLBACK_URL,
    });

    if (account.expiresAt && account.refreshToken && account.expiresAt.getTime() - Date.now() < REFRESH_THRESHOLD_MS) {
      const refreshed = await client.oauth.refreshToken(account.refreshToken);
      account.accessToken = refreshed.access_token;
      account.refreshToken = refreshed.refresh_token || account.refreshToken;
      account.tokenType = refreshed.token_type;
      account.expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
      account.scope = refreshed.scope ? refreshed.scope.split(' ') : account.scope;
      await account.save();
      client.setToken(refreshed);
    } else {
      client.setToken({
        access_token: account.accessToken,
        refresh_token: account.refreshToken || '',
        token_type: account.tokenType || 'bearer',
        expires_in: Math.max(0, account.expiresAt ? Math.floor((account.expiresAt.getTime() - Date.now()) / 1000) : 0),
        scope: account.scope ? account.scope.join(' ') : '',
      });
    }

    // Default listener: this is the "bot does something" part of the demo. It only ever fires
    // for events this user is actually subscribed to.
    client.on(WebhookEvents.CHAT_MESSAGE_SENT, (payload) => this.replyToPing(client, payload));

    this.clients.set(kickUserId, client);
    return client;
  }

  private async replyToPing(client: KickClient, payload: ChatMessageSentEventPayload) {
    logger.info(`[chat] ${payload.sender.username}: ${payload.content}`);
    if (payload.content.trim().toLowerCase() === '!ping') {
      await client.chat.send({ content: 'pong!', type: ChatMessageType.BOT });
    }
  }
}

export const kickClientRegistry = new KickClientRegistry();
