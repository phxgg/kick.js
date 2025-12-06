import z from 'zod';

import { KICK_BASE_URL, KickClient } from '../KickClient';
import { handleError } from '../utils';

export const banUserSchema = z.object({
  broadcasterUserId: z.number().int().positive(),
  userId: z.number().int().positive(),
  reason: z.string().max(100).optional(),
});
export type BanUserDto = z.infer<typeof banUserSchema>;

export const timeoutUserSchema = banUserSchema.extend({
  duration: z.number().int().min(1).max(10080), // max 7 days
});
export type TimeoutUserDto = z.infer<typeof timeoutUserSchema>;

export const removeBanSchema = z.object({
  broadcasterUserId: z.number().int().positive(),
  userId: z.number().int().positive(),
});
export type RemoveBanDto = z.infer<typeof removeBanSchema>;

export class ModerationService {
  private readonly MODERATION_URL: string = KICK_BASE_URL + '/moderation';
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
   * @param options The options for banning a user
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the user is being banned
   * @param options.userId The ID of the user to be banned
   * @param options.reason (Optional) The reason for the ban
   * @returns void
   */
  async banUser({ broadcasterUserId, userId, reason }: BanUserDto): Promise<void> {
    const schema = banUserSchema.safeParse({ broadcasterUserId, userId, reason });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: schema.data.broadcasterUserId,
        user_id: schema.data.userId,
        reason: schema.data.reason,
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
   * @param options The options for timing out a user
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the user is being timed out
   * @param options.userId The ID of the user to be timed out
   * @param options.reason (Optional) The reason for the timeout
   * @param options.duration The duration of the timeout in seconds (max 7 days)
   * @returns void
   */
  async timeoutUser({ broadcasterUserId, userId, reason, duration }: TimeoutUserDto): Promise<void> {
    const schema = timeoutUserSchema.safeParse({ broadcasterUserId, userId, reason, duration });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: schema.data.broadcasterUserId,
        user_id: schema.data.userId,
        reason: schema.data.reason,
        duration: schema.data.duration,
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
  async removeBan({ broadcasterUserId, userId }: RemoveBanDto): Promise<void> {
    const schema = removeBanSchema.safeParse({ broadcasterUserId, userId });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.MODERATION_URL + '/bans');

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: schema.data.broadcasterUserId,
        user_id: schema.data.userId,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }
}
