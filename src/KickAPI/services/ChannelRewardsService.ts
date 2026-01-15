import z from 'zod';

import { BaseResponse, BaseResponseWithPagination } from '../BaseResponse';
import { KickClient } from '../KickClient';
import { ChannelReward, ChannelRewardDto } from '../resources/ChannelReward';
import {
  ChannelRewardAcceptRedemptionDto,
  ChannelRewardRedemption,
  ChannelRewardRedemptionDto,
  ChannelRewardRedemptionStatus,
  ChannelRewardRejectRedemptionDto,
} from '../resources/ChannelRewardRedemption';
import { Scope } from '../Scope';
import { constructEndpoint, handleError, parseJSON } from '../utils';
import { Version } from '../Version';

// Responses
export type FetchChannelRewardsResponse = BaseResponse<ChannelRewardDto[]>;
export type CreateChannelRewardResponse = BaseResponse<ChannelRewardDto>;
export type GetChannelRewardRedemptionsResponse = BaseResponseWithPagination<ChannelRewardRedemptionDto[]>;
export type AcceptRedemptionsResponse = BaseResponse<ChannelRewardAcceptRedemptionDto[]>;
export type RejectRedemptionsResponse = BaseResponse<ChannelRewardRejectRedemptionDto[]>;

// Schemas
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

export type GetChannelRewardRedemptionsParams = {
  reward_id?: string;
  status?: ChannelRewardRedemptionStatus;
  id?: string[];
  cursor?: string;
};

export const acceptRedemptionsSchema = z.object({
  ids: z.array(z.string()).min(1).max(25),
});
export type AcceptRedemptionsDto = z.infer<typeof acceptRedemptionsSchema>;

export const rejectRedemptionsSchema = acceptRedemptionsSchema;
export type RejectRedemptionsDto = z.infer<typeof rejectRedemptionsSchema>;

// Service
export class ChannelRewardsService {
  private readonly CHANNEL_REWARDS_URL = constructEndpoint(Version.V1, 'channels/rewards');
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
    this.client.requiresScope(Scope.CHANNEL_REWARDS_READ);

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
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

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
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

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
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

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

  /**
   * Get channel reward redemptions for a broadcaster's channel.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @returns An array of `ChannelRewardRedemption` instances.
   */
  async getRedemptions({
    reward_id,
    status,
    id,
    cursor,
  }: GetChannelRewardRedemptionsParams): Promise<ChannelRewardRedemption[]> {
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

    const endpoint = new URL(`${this.CHANNEL_REWARDS_URL}/redemptions`);

    if (reward_id) {
      endpoint.searchParams.append('reward_id', reward_id);
    }
    if (status) {
      endpoint.searchParams.append('status', status);
    }
    if (id) {
      for (const redemptionId of id) {
        endpoint.searchParams.append('id', redemptionId);
      }
    }
    if (cursor) {
      endpoint.searchParams.append('cursor', cursor);
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<GetChannelRewardRedemptionsResponse>(response);
    const redemptions = json.data.map((redemption) => new ChannelRewardRedemption(this.client, redemption));
    return redemptions;
  }

  /**
   * Accept channel reward redemptions for a broadcaster's channel. The response will only include data for redemptions that failed to be accepted.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @param ids The IDs of the redemptions to accept
   * @returns An array of `ChannelRewardAcceptRedemptionDto` instances for redemptions that failed to be accepted.
   */
  async acceptRedemptions({ ids }: AcceptRedemptionsDto): Promise<ChannelRewardAcceptRedemptionDto[]> {
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

    const schema = acceptRedemptionsSchema.safeParse({ ids });

    if (!schema.success) {
      throw new Error(`Invalid data: ${schema.error.message}`);
    }

    const endpoint = new URL(`${this.CHANNEL_REWARDS_URL}/redemptions/accept`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: schema.data.ids,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<AcceptRedemptionsResponse>(response);
    return json.data;
  }

  /**
   * Reject channel reward redemptions for a broadcaster's channel. The response will only include data for redemptions that failed to be rejected.
   *
   * Required scopes:
   * `channel:rewards:write`
   *
   * @param ids The IDs of the redemptions to reject
   * @returns An array of `ChannelRewardRejectRedemptionDto` instances for redemptions that failed to be rejected.
   */
  async rejectRedemptions({ ids }: RejectRedemptionsDto): Promise<ChannelRewardRejectRedemptionDto[]> {
    this.client.requiresScope(Scope.CHANNEL_REWARDS_WRITE);

    const schema = rejectRedemptionsSchema.safeParse({ ids });

    if (!schema.success) {
      throw new Error(`Invalid data: ${schema.error.message}`);
    }

    const endpoint = new URL(`${this.CHANNEL_REWARDS_URL}/redemptions/reject`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: schema.data.ids,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<RejectRedemptionsResponse>(response);
    return json.data;
  }
}
