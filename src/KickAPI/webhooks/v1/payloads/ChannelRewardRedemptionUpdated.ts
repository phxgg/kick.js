import type { ChannelRewardRedemptionStatus } from '@/KickAPI/resources/ChannelRewardRedemption';

import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type ChannelRewardRedemptionUpdatedEventPayload = {
  id: string;
  user_input: string;
  status: ChannelRewardRedemptionStatus;
  redeemed_at: string;
  reward: {
    id: string;
    title: string;
    cost: number;
    description: string;
  };
  redeemer: Omit<UserEventProperty, 'identity' | 'is_anonymous'>;
  broadcaster: Omit<UserEventProperty, 'identity' | 'is_anonymous'>;
};
