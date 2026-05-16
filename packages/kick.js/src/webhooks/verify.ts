import crypto from 'crypto';

export interface KickWebhookSignatureInput {
  /** Value of the `kick-event-message-id` header. */
  messageId: string;
  /** Value of the `kick-event-message-timestamp` header. */
  messageTimestamp: string;
  /** Raw request body bytes (do not parse JSON before passing). */
  rawBody: string | Buffer;
  /** Value of the `kick-event-signature` header (base64-encoded). */
  signature: string;
  /** Kick public key in PEM format. Use `getKickPublicKey()` to fetch and cache it. */
  publicKey: string;
}

/**
 * Verifies the RSA-SHA256 signature Kick attaches to webhook deliveries.
 * Construct payload = `${messageId}.${messageTimestamp}.${rawBody}`.
 *
 * Returns `true` when the signature is valid; `false` otherwise. Throws only on
 * malformed input (e.g. invalid PEM).
 */
export function verifyKickSignature(input: KickWebhookSignatureInput): boolean {
  const body = typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8');
  const construct = `${input.messageId}.${input.messageTimestamp}.${body}`;
  const verifier = crypto.createVerify('RSA-SHA256').update(construct);
  return verifier.verify(input.publicKey, Buffer.from(input.signature, 'base64'));
}
