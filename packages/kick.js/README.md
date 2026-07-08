# @phxgg/kick.js

A JavaScript/TypeScript client for the [Kick.com public API](https://docs.kick.com).

> [!WARNING]
> This project is in early development. The API may change significantly between releases.

## Installation

```bash
npm install @phxgg/kick.js
```

## Table of contents

- [Setup](#setup)
- [OAuth](#oauth)
- [Users](#users)
- [Channels](#channels)
- [Livestreams](#livestreams)
- [Categories](#categories)
- [Chat](#chat)
- [Channel Rewards](#channel-rewards)
- [Moderation](#moderation)
- [KICKs](#kicks)
- [Event Subscriptions](#event-subscriptions)
- [Webhooks](#webhooks)
- [Error handling](#error-handling)

---

## Setup

```ts
import { KickClient } from '@phxgg/kick.js';

const client = new KickClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'https://yourapp.com/oauth/callback', // required for OAuth flows
});
```

Once you have a user token (obtained via [OAuth](#oauth)), attach it to the client:

```ts
client.setToken({
  access_token: 'USER_ACCESS_TOKEN',
  refresh_token: 'USER_REFRESH_TOKEN',
  token_type: 'bearer',
  expires_in: 3600,
  scope: 'user:read channel:read',
});
```

After `setToken` is called, the client automatically fetches the authenticated user in the background and registers itself in the global event manager so that [webhook events](#webhooks) can be routed to it.

---

## OAuth

### Generate authorization URL

Redirect your user to this URL to begin the authorization flow. Store the `codeVerifier` in the session - you'll need it in the next step.

```ts
const { url, codeVerifier } = await client.oauth.generateAuthorizeURL();
// redirect user to `url`
```

### Exchange code for token

```ts
const token = await client.oauth.exchangeToken(code, codeVerifier);
client.setToken(token);
```

### Generate an app token (client credentials)

Use this for API calls that don't require a user context.

```ts
const appToken = await client.oauth.generateAppToken();
client.setAppToken(appToken);
```

### Refresh a token

```ts
const refreshed = await client.oauth.refreshToken(token.refresh_token);
client.setToken(refreshed);
```

### Revoke a token

```ts
import { TokenHintType } from '@phxgg/kick.js';

await client.oauth.revokeToken(token.access_token, TokenHintType.ACCESS_TOKEN);
```

### Introspect a token

```ts
const info = await client.oauth.introspect();
console.log(info.active, info.scope);
```

---

## Users

Required scope: `user:read`

```ts
// Fetch the authenticated user
const me = await client.users.me();
console.log(me.name, me.email, me.userId);

// Fetch specific users by ID
const users = await client.users.fetch([123, 456]);
```

---

## Channels

Required scope: `channel:read` (read), `channel:write` (update)

```ts
// Fetch by slug
const channel = await client.channels.fetchBySlug('monstercat');

// Fetch by broadcaster user ID
const channel = await client.channels.fetchById(123);

// Fetch multiple at once
const channels = await client.channels.fetch({ slug: ['monstercat', 'kick'] });
// or: client.channels.fetch({ broadcasterUserId: [123, 456] })

// Update the authenticated user's channel
await client.channels.update({
  streamTitle: 'My new stream title',
  categoryId: 15,
  customTags: ['gaming', 'chill'],
});
```

---

## Livestreams

```ts
// Fetch live streams (no scope required), paginated via cursor
const streams = await client.livestreamsV2.fetch({
  categoryId: [15],
  language_code: ['en'],
  limit: 20,
  cursor: undefined, // pass the cursor from a previous response to page through results
});

// Fetch live streams for specific users
const userStreams = await client.livestreamsV2.fetchByUsers({ userIds: [123, 456] });

// Total live stream count
const stats = await client.livestreamsV2.fetchStats();
console.log(stats.total_count);
```

> [!NOTE]
> `client.livestreams` (v1) is deprecated in favor of `client.livestreamsV2`, which supports cursor-based pagination and `fetchByUsers`.

---

## Categories

```ts
// Search by name/tag/id, paginated via cursor
const results = await client.categoriesV2.search({ name: ['gaming'], limit: 10 });
// or: client.categoriesV2.search({ tag: ['irl'] })
// or: client.categoriesV2.search({ id: [15, 16] })

// Fetch a single category by ID
const category = await client.categoriesV2.fetch(15);
```

> [!NOTE]
> `client.categories` (v1) is deprecated in favor of `client.categoriesV2`.

---

## Chat

Required scope: `chat:write` (send), `moderation:chat_message:manage` (delete)

```ts
import { ChatMessageType } from '@phxgg/kick.js';

// Send a bot message (default)
const message = await client.chat.send({
  content: 'Hello from kick.js!',
});

// Send a message as the authenticated user to a specific channel
const message = await client.chat.send({
  content: 'Hello!',
  broadcasterUserId: 123,
  type: ChatMessageType.USER,
});

// Reply to a message
const reply = await client.chat.send({
  content: 'Nice catch!',
  replyToMessageId: 'some-message-id',
});

// Delete a message
await client.chat.delete('some-message-id');
```

---

## Channel Rewards

Required scope: `channel:rewards:read` (read), `channel:rewards:write` (create / update / delete)

```ts
// Fetch all rewards for the authenticated broadcaster
const rewards = await client.channelRewards.fetch();

// Create a reward
const reward = await client.channelRewards.create({
  title: 'Hydrate!',
  cost: 500,
  description: 'Make the streamer drink water.',
  isEnabled: true,
  isUserInputRequired: false,
});

// Update a reward
await client.channelRewards.update(reward.id, {
  cost: 1000,
  isPaused: false,
});

// Delete a reward
await client.channelRewards.delete(reward.id);

// Fetch redemptions (defaults to pending)
const redemptions = await client.channelRewards.getRedemptions({
  rewardId: reward.id,
  status: 'pending',
});

// Accept / reject redemptions (up to 25 per call)
await client.channelRewards.acceptRedemptions({ ids: [redemptions[0].id] });
await client.channelRewards.rejectRedemptions({ ids: [redemptions[1].id] });
```

---

## Moderation

Required scope: `moderation:ban`

```ts
// Ban a user permanently
await client.moderation.banUser({
  broadcasterUserId: 123,
  userId: 456,
  reason: 'Spamming',
});

// Timeout a user (duration in minutes, max 10080 = 7 days)
await client.moderation.timeoutUser({
  broadcasterUserId: 123,
  userId: 456,
  duration: 10,
  reason: 'Cool off.',
});

// Remove a ban or timeout
await client.moderation.removeBan({
  broadcasterUserId: 123,
  userId: 456,
});
```

---

## KICKs

Required scope: `kicks:read`

```ts
// Fetch the KICKs leaderboard for the authenticated broadcaster
const leaderboard = await client.kicks.fetchLeaderboard({ top: 10 });
```

---

## Event subscriptions

Required scope: `events:subscribe`

Subscribe your app to receive webhook events for a broadcaster.

```ts
import { WebhookEvents } from '@phxgg/kick.js';

// Subscribe to a single event
await client.events.subscribe({
  broadcasterUserId: 123,
  event: { name: WebhookEvents.CHAT_MESSAGE_SENT, version: 1 },
});

// Subscribe to multiple events at once
await client.events.subscribeMultiple({
  broadcasterUserId: 123,
  events: [
    { name: WebhookEvents.CHANNEL_FOLLOWED, version: 1 },
    { name: WebhookEvents.LIVESTREAM_STATUS_UPDATED, version: 1 },
  ],
});

// List active subscriptions
const subs = await client.events.fetch();

// Unsubscribe
await client.events.unsubscribe(subs[0].id);
await client.events.unsubscribeMultiple(subs.map((s) => s.id));
```

---

## Webhooks

kick.js provides framework-agnostic primitives so you can handle Kick webhook deliveries in any HTTP server.

### Verify & dispatch

```ts
import { verifyKickSignature, dispatchWebhookEvent, getKickPublicKey } from '@phxgg/kick.js';

// Inside your POST /webhooks/kick handler:
const publicKey = await getKickPublicKey(); // cached, refreshes every hour

const valid = verifyKickSignature({
  messageId: req.headers['kick-event-message-id'],
  messageTimestamp: req.headers['kick-event-message-timestamp'],
  rawBody: rawBody, // Buffer or string - must be read before JSON.parse
  signature: req.headers['kick-event-signature'],
  publicKey,
});

if (!valid) return res.sendStatus(403);

const eventType = req.headers['kick-event-type'];
const payload = JSON.parse(rawBody);

// Route to whichever KickClient is registered for this broadcaster
dispatchWebhookEvent(eventType, payload);

res.sendStatus(200);
```

### Per-client listeners

After calling `client.setToken()`, the client registers itself so that `dispatchWebhookEvent` can route events to the correct instance. Use `client.on()` to react to events:

```ts
import { WebhookEvents } from '@phxgg/kick.js';

client.on(WebhookEvents.CHAT_MESSAGE_SENT, (payload) => {
  console.log(`${payload.sender.username}: ${payload.content}`);
});

client.on(WebhookEvents.CHANNEL_FOLLOWED, (payload) => {
  console.log(`${payload.follower.username} followed the channel!`);
});

client.on(WebhookEvents.LIVESTREAM_STATUS_UPDATED, (payload) => {
  console.log('Stream is now', payload.is_live ? 'live' : 'offline');
});

// Remove a listener
client.off(WebhookEvents.CHAT_MESSAGE_SENT, myListener);

// Remove all listeners
client.removeAllListeners();

// Clean up the client and deregister it from the event manager
client.destroy();
```

**Supported webhook events**

| Event                               | Constant                                          |
| ----------------------------------- | ------------------------------------------------- |
| `chat.message.sent`                 | `WebhookEvents.CHAT_MESSAGE_SENT`                 |
| `channel.followed`                  | `WebhookEvents.CHANNEL_FOLLOWED`                  |
| `channel.subscription.new`          | `WebhookEvents.CHANNEL_SUBSCRIPTION_NEW`          |
| `channel.subscription.renewal`      | `WebhookEvents.CHANNEL_SUBSCRIPTION_RENEWAL`      |
| `channel.subscription.gifts`        | `WebhookEvents.CHANNEL_SUBSCRIPTION_GIFTS`        |
| `channel.reward.redemption.updated` | `WebhookEvents.CHANNEL_REWARD_REDEMPTION_UPDATED` |
| `livestream.status.updated`         | `WebhookEvents.LIVESTREAM_STATUS_UPDATED`         |
| `livestream.metadata.updated`       | `WebhookEvents.LIVESTREAM_METADATA_UPDATED`       |
| `moderation.banned`                 | `WebhookEvents.MODERATION_BANNED`                 |
| `kicks.gifted`                      | `WebhookEvents.KICKS_GIFTED`                      |

### Drops fulfillment webhook

Separate from the events above: when a viewer claims a drop reward, Kick sends a synchronous
POST to the fulfillment URL configured for your organization. It has no `Kick-Event-Type`
header and no `broadcaster` field (it isn't scoped to a channel), so it isn't routed through
`dispatchWebhookEvent`/`client.on()` - handle it directly in its own route. Reuse
`verifyKickSignature` for authenticity, and respond `200 OK` - including on retries, so treat
`claim_id` as an idempotency key.

```ts
import { getKickPublicKey, verifyKickSignature, type DropClaimFulfillmentPayload } from '@phxgg/kick.js';

// Inside your POST /webhooks/kick/drops handler:
const publicKey = await getKickPublicKey();

const valid = verifyKickSignature({
  messageId: req.headers['kick-event-message-id'],
  messageTimestamp: req.headers['kick-event-message-timestamp'],
  rawBody, // Buffer or string - must be read before JSON.parse
  signature: req.headers['kick-event-signature'],
  publicKey,
});

if (!valid) return res.sendStatus(403);

const claim: DropClaimFulfillmentPayload = JSON.parse(rawBody);

// Look up claim.claim_id first - if you've already processed it, just return 200.
await grantReward(claim); // your fulfillment logic

// Report fulfillment status back so it shows up in the Kick dashboard.
await client.dropsService.updateOne(claim.claim_id, 'fulfilled');

res.sendStatus(200);
```

---

## Error handling

All methods throw typed errors on non-2xx responses:

```ts
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  BadRequestError,
  MissingScopeError,
  NoTokenSetError,
} from '@phxgg/kick.js';

try {
  const me = await client.users.me();
} catch (err) {
  if (err instanceof UnauthorizedError) {
    // token expired - refresh and retry
  } else if (err instanceof MissingScopeError) {
    // the token is missing a required scope
  } else if (err instanceof RateLimitError) {
    // back off and retry
  } else {
    throw err;
  }
}
```

---

## Example app

A full Express + MongoDB reference implementation is available in [`examples/express-app`](https://github.com/phxgg/kick.js/tree/main/examples/express-app).

## License

[MIT](./LICENSE)
