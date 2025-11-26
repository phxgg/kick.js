import type { GiftEventProperty, UserEventProperty } from '../Properties';

export type KicksGiftedEventPayload = {
  broadcaster: Omit<UserEventProperty, 'identity' | 'is_anonymous'>;
  sender: Omit<UserEventProperty, 'identity' | 'is_anonymous'>;
  gift: GiftEventProperty;
  created_at: string;
};
