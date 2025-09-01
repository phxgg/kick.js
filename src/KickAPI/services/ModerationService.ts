import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';
import { Message } from '../Message';

export type BanUserDto = {
  broadcasterUserId: number | string;
  userId: number | string;
  reason?: string;
};

export type TimeoutUserDto = BanUserDto & {
  duration: number;
};

export type RemoveBanDto = {
  broadcasterUserId: number | string;
  userId: number | string;
};

export class ModerationService {
  private readonly MODERATION_URL: string = KICK_BASE_URL + '/moderation';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  async banUser({ broadcasterUserId, userId, reason }: BanUserDto): Promise<void> {
    const response = await fetch(`${this.MODERATION_URL}/bans`, {
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

  async timeoutUser({ broadcasterUserId, userId, reason, duration }: TimeoutUserDto): Promise<void> {
    const response = await fetch(`${this.MODERATION_URL}/bans`, {
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

  async removeBan({ broadcasterUserId, userId }: RemoveBanDto): Promise<void> {
    const response = await fetch(`${this.MODERATION_URL}/bans`, {
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
