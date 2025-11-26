import { KICK_BASE_URL, KickClient } from '../KickClient';
import { handleError } from '../utils';

export type BanUserDto = {
  broadcasterUserId: number;
  userId: number;
  reason?: string;
};

export type TimeoutUserDto = BanUserDto & {
  duration: number;
};

export type RemoveBanDto = {
  broadcasterUserId: number;
  userId: number;
};

export class ModerationService {
  private readonly MODERATION_URL: string = KICK_BASE_URL + '/moderation';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Ban a user from a channel.
   *
   * @param options The options for banning a user
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the user is being banned
   * @param options.userId The ID of the user to be banned
   * @param options.reason (Optional) The reason for the ban
   * @returns void
   */
  async banUser({ broadcasterUserId, userId, reason }: BanUserDto): Promise<void> {
    if (reason && reason.length > 100) {
      throw new Error('Reason exceeds maximum length of 100 characters');
    }

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
        reason,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Timeout a user in a channel.
   *
   * @param options The options for timing out a user
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the user is being timed out
   * @param options.userId The ID of the user to be timed out
   * @param options.reason (Optional) The reason for the timeout
   * @param options.duration The duration of the timeout in seconds (max 7 days)
   * @returns void
   */
  async timeoutUser({ broadcasterUserId, userId, reason, duration }: TimeoutUserDto): Promise<void> {
    if (reason && reason.length > 100) {
      throw new Error('Reason exceeds maximum length of 100 characters');
    }
    if (duration < 1 || duration > 10080) {
      throw new Error('Duration must be between 1 and 10080 seconds (7 days)');
    }

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
        reason,
        duration,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Remove a ban or timeout from a user in a channel.
   *
   * @param options The options for removing a ban or timeout
   * @param options.broadcasterUserId The ID of the broadcaster from whose channel the ban/timeout is being removed
   * @param options.userId The ID of the user whose ban/timeout is being removed
   * @returns void
   */
  async removeBan({ broadcasterUserId, userId }: RemoveBanDto): Promise<void> {
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
