import z from 'zod';

import { BaseResponse } from '../BaseResponse';
import { ChannelReward, ChannelRewardDto } from '../ChannelReward';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { handleError, parseJSON } from '../utils';

export type FetchChannelRewardsResponse = BaseResponse<ChannelRewardDto[]>;
export type CreateChannelRewardResponse = BaseResponse<ChannelRewardDto>;

export const createChannelRewardSchema = z.object({
  backgroundColor: z.string().optional(),
  cost: z.number().min(1),
  description: z.string().max(200).optional(),
  isEnabled: z.boolean().optional(),
  isUserInputRequired: z.boolean().optional(),
  shouldRedemptionsSkipRequestQueue: z.boolean().optional(),
  title: z.string().max(50),
});
export type CreateChannelRewardDto = z.infer<typeof createChannelRewardSchema>;

export const updateChannelRewardSchema = z.object({
  backgroundColor: z.string().optional(),
  cost: z.number().min(1).optional(),
  description: z.string().max(200).optional(),
  isEnabled: z.boolean().optional(),
  isPaused: z.boolean().optional(),
  isUserInputRequired: z.boolean().optional(),
  shouldRedemptionsSkipRequestQueue: z.boolean().optional(),
  title: z.string().max(50).optional(),
});
export type UpdateChannelRewardDto = z.infer<typeof updateChannelRewardSchema>;

export class ChannelRewardsService {
  private readonly CHANNEL_REWARDS_URL: string = KICK_BASE_URL + '/channels/rewards';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get channel rewards for a broadcaster's channel.
   * Channels may have up to 15 rewards, including both enabled and disabled rewards.
   *
   * Required scopes:
   * `channel:rewards:read`
   *
   * @returns An array of `ChannelReward` instances.
   */
  async fetch(): Promise<ChannelReward[]> {
    const endpoint = new URL(this.CHANNEL_REWARDS_URL);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchChannelRewardsResponse>(response);
    const rewards = json.data.map((reward) => new ChannelReward(this.client, reward));
    return rewards;
  }

  /**
   * Creates a channel reward in the broadcaster's channel.
   * A maximum of 15 rewards can be created, including both enabled and disabled rewards.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @returns The created `ChannelReward` instance.
   */
  async create({
    backgroundColor,
    cost,
    description,
    isEnabled,
    isUserInputRequired,
    shouldRedemptionsSkipRequestQueue,
    title,
  }: CreateChannelRewardDto): Promise<ChannelReward> {
    const schema = createChannelRewardSchema.safeParse({
      backgroundColor,
      cost,
      description,
      isEnabled,
      isUserInputRequired,
      shouldRedemptionsSkipRequestQueue,
      title,
    });

    if (!schema.success) {
      throw new Error(`Invalid data: ${schema.error.message}`);
    }

    const endpoint = new URL(this.CHANNEL_REWARDS_URL);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        background_color: schema.data.backgroundColor,
        cost: schema.data.cost,
        description: schema.data.description,
        is_enabled: schema.data.isEnabled,
        is_user_input_required: schema.data.isUserInputRequired,
        should_redemptions_skip_request_queue: schema.data.shouldRedemptionsSkipRequestQueue,
        title: schema.data.title,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<CreateChannelRewardResponse>(response);
    const reward = new ChannelReward(this.client, json.data);
    return reward;
  }

  /**
   * Deletes a channel reward in the broadcaster's channel. Note that only the app that created the reward can delete it.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @param rewardId The ID of the reward to delete
   */
  async delete(rewardId: string): Promise<void> {
    const endpoint = new URL(`${this.CHANNEL_REWARDS_URL}/${rewardId}`);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }
  }

  /**
   * Updates a channel reward in the broadcaster's channel. Note that only the app that created the reward can update it.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @param rewardId The ID of the reward to update
   * @param data The data to update the reward with
   * @returns The updated `ChannelReward` instance.
   */
  async update(rewardId: string, data: UpdateChannelRewardDto): Promise<ChannelReward> {
    const schema = updateChannelRewardSchema.safeParse(data);

    if (!schema.success) {
      throw new Error(`Invalid data: ${schema.error.message}`);
    }

    const endpoint = new URL(`${this.CHANNEL_REWARDS_URL}/${rewardId}`);

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        background_color: schema.data.backgroundColor,
        cost: schema.data.cost,
        description: schema.data.description,
        is_enabled: schema.data.isEnabled,
        is_paused: schema.data.isPaused,
        is_user_input_required: schema.data.isUserInputRequired,
        should_redemptions_skip_request_queue: schema.data.shouldRedemptionsSkipRequestQueue,
        title: schema.data.title,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<CreateChannelRewardResponse>(response);
    const reward = new ChannelReward(this.client, json.data);
    return reward;
  }
}
