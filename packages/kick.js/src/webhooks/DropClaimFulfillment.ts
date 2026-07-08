/**
 * Payload Kick POSTs synchronously to your drops fulfillment webhook URL when a
 * viewer claims a drop reward. Unlike the `events:subscribe` webhooks, this has
 * no `Kick-Event-Type` header and isn't scoped to a broadcaster - verify it with
 * `verifyKickSignature` using the same `Kick-Event-Message-ID` /
 * `Kick-Event-Timestamp` / `Kick-Event-Signature` headers, then respond 200 OK.
 * Treat `claim_id` as an idempotency key (Kick may redeliver).
 * @see https://docs.kick.com/drops/drops-guide#fulfillment
 */
export type DropClaimFulfillmentPayload = {
  claim_id: string;
  user_id: number;
  campaign_id: string;
  reward_id: string;
  external_id?: string;
};
