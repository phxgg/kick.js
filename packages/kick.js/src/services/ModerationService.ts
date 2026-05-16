import z from 'zod';

import type { KickClient } from '../KickClient.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError } from '../utils.js';
import { Version } from '../Version.js';

export const banUserSchema = z.object({
  broadcasterUserId: z.number().int().positive(),
  userId: z.number().int().positive(),
  reason: z.string().max(100).optional(),
});
export type BanUserParams = z.infer<typeof banUserSchema>;

export const timeoutUserSchema = banUserSchema.extend({
  duration: z.number().int().min(1).max(10080), // max 7 days
});
export type TimeoutUserParams = z.infer<typeof timeoutUserSchema>;

export const removeBanSchema = z.object({
  broadcasterUserId: z.number().int().positive(),
  userId: z.number().int().positive(),
});
export type RemoveBanParams = z.infer<typeof removeBanSchema>;

export class ModerationService {
  private readonly MODERATION_URL = constructEndpoint(Version.V1, 'moderation');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Ban a user from a channel.
   *
   * Required scopes:
   * `moderation:ban`
   *
   * @param params The parameters for banning a user
   * @param params.broadcasterUserId The ID of the broadcaster from whose channel the user is being banned
   * @param params.userId The ID of the user to be banned
   * @param params.reason (Optional) The reason for the ban
   * @returns void
   */
  async banUser(params: BanUserParams): Promise<void> {
    this.client.requiresScope(Scope.MODERATION_BAN);

    const schema = banUserSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, userId, reason } = schema.data;
    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        user_id: userId,
        reason: reason,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Timeout a user in a channel.
   *
   * Required scopes:
   * `moderation:ban`
   *
   * @param params The parameters for timing out a user
   * @param params.broadcasterUserId The ID of the broadcaster from whose channel the user is being timed out
   * @param params.userId The ID of the user to be timed out
   * @param params.reason (Optional) The reason for the timeout
   * @param params.duration The duration of the timeout in seconds (max 7 days)
   * @returns void
   */
  async timeoutUser(params: TimeoutUserParams): Promise<void> {
    this.client.requiresScope(Scope.MODERATION_BAN);

    const schema = timeoutUserSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, userId, reason, duration } = schema.data;
    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        user_id: userId,
        reason: reason,
        duration: duration,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Remove a ban or timeout from a user in a channel.
   *
   * Required scopes:
   * `moderation:ban`
   *
   * @param options The options for removing a ban or timeout
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the ban/timeout is being removed
   * @param options.userId The ID of the user whose ban/timeout is being removed
   * @returns void
   */
  async removeBan(params: RemoveBanParams): Promise<void> {
    this.client.requiresScope(Scope.MODERATION_BAN);

    const schema = removeBanSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, userId } = schema.data;
    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }
}
