import type { EmoteEventProperty, UserEventProperty, WithIdentity, WithIdentityNull } from '../Properties';

export type ChatMessageSentEventPayload = {
  message_id: string;
  replies_to: {
    message_id: string;
    content: string;
    sender: WithIdentityNull<UserEventProperty>;
  };
  broadcaster: WithIdentityNull<UserEventProperty>;
  sender: WithIdentity<UserEventProperty>;
  content: string;
  emotes: EmoteEventProperty[];
  created_at: string;
};
