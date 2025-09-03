import type { CategoryDto } from '../../Category';

// Nested types
export type EventUserIdentityData = {
  username_color: string;
  badges: {
    text: string;
    type: string;
    count?: number;
  }[];
};

export type EventUserData = {
  is_anonymous: boolean;
  user_id: number;
  username: string;
  is_verified: boolean;
  profile_picture: string;
  channel_slug: string;
  identity: EventUserIdentityData | null;
};

// Helper “override” utilities
export type WithIdentityNull<T extends { identity?: any }> = Omit<T, 'identity'> & { identity: null };
export type WithIdentity<T extends { identity?: any }> = Omit<T, 'identity'> & { identity: EventUserIdentityData };

export type EventEmoteData = {
  emote_id: string;
  positions: {
    s: number;
    e: number;
  }[];
};

export type LivestreamMetadataData = {
  title: string;
  language: string;
  has_mature_content: boolean;
  category: CategoryDto;
};

// Chat
export type ChatMessageSentEventData = {
  message_id: string;
  replies_to: {
    message_id: string;
    content: string;
    sender: WithIdentityNull<EventUserData>;
  };
  broadcaster: WithIdentityNull<EventUserData>;
  sender: WithIdentity<EventUserData>;
  content: string;
  emotes: EventEmoteData[];
  created_at: string;
};

// Channel
export type ChannelFollowedEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  follower: WithIdentityNull<EventUserData>;
};

export type ChannelSubscriptionRenewalEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  subscriber: WithIdentityNull<EventUserData>;
  duration: number;
  created_at: string;
  expires_at: string;
};

export type ChannelSubscriptionGiftsEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  gifter: WithIdentityNull<EventUserData>;
  giftees: WithIdentityNull<EventUserData>[];
  created_at: string;
  expires_at: string;
};

export type ChannelSubscriptionNewEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  subscriber: WithIdentityNull<EventUserData>;
  duration: number;
  created_at: string;
  expires_at: string;
};

// Livestream
export type LivestreamStatusUpdatedEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  is_live: boolean;
  title: string;
  started_at: string;
  ended_at: string | null;
};

export type LivestreamMetadataUpdatedEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  metadata: LivestreamMetadataData;
};

// Moderation
export type ModerationBannedEventData = {
  broadcaster: WithIdentityNull<EventUserData>;
  moderator: WithIdentityNull<EventUserData>;
  banned_user: WithIdentityNull<EventUserData>;
  metadata: {
    reason: string;
    created_at: string;
    expires_at: string | null; // null for permanent bans
  };
};
