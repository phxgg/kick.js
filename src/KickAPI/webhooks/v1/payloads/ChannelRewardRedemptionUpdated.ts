import type { UserEventProperty, WithIdentityNull } from '../Properties';

export type ChannelRewardRedemptionUpdatedEventPayload = {
  id: string;
  user_input: string;
  status: 'pending' | 'accepted' | 'rejected';
  redeemed_at: string;
  reward: {
    id: string;
    title: string;
    costs: number;
    description: string;
  };
  redeemer: WithIdentityNull<UserEventProperty>;
  broadcaster: WithIdentityNull<UserEventProperty>;
};
