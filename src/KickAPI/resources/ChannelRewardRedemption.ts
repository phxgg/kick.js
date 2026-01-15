import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type ChannelRewardRedemptionStatus = 'pending' | 'accepted' | 'rejected';

type RedemptionDto = {
  id: string;
  redeemed_at: string;
  redeemer: {
    broadcaster_user_id: number;
  };
  status: ChannelRewardRedemptionStatus;
  user_input: string;
};

export type ChannelRewardRedemptionDto = {
  redemptions: RedemptionDto[];
  reward: {
    can_manage: boolean;
    cost: number;
    description: string;
    id: string;
    is_deleted: boolean;
    title: string;
  };
};

export type ChannelRewardAcceptRedemptionDto = {
  id: string;
  reason: string;
};

export type ChannelRewardRejectRedemptionDto = {
  id: string;
  reason: string;
};

export class ChannelRewardRedemption extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: ChannelRewardRedemptionDto
  ) {
    super();
    this.client = client;
  }

  get redemptions(): {
    id: string;
    redeemedAt: Date;
    redeemer: {
      broadcasterUserId: number;
    };
    status: ChannelRewardRedemptionStatus;
    userInput: string;
  }[] {
    return this.dto.redemptions.map((redemption) => ({
      id: redemption.id,
      redeemedAt: new Date(redemption.redeemed_at),
      redeemer: {
        broadcasterUserId: redemption.redeemer.broadcaster_user_id,
      },
      status: redemption.status,
      userInput: redemption.user_input,
    }));
  }

  get reward(): {
    canManage: boolean;
    cost: number;
    description: string;
    id: string;
    isDeleted: boolean;
    title: string;
  } {
    return {
      canManage: this.dto.reward.can_manage,
      cost: this.dto.reward.cost,
      description: this.dto.reward.description,
      id: this.dto.reward.id,
      isDeleted: this.dto.reward.is_deleted,
      title: this.dto.reward.title,
    };
  }
}
