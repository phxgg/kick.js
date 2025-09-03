import type { CategoryDto } from '../../Category';

export type UserIdentityEventProperty = {
  username_color: string;
  badges: {
    text: string;
    type: string;
    count?: number;
  }[];
};

export type UserEventProperty = {
  is_anonymous: boolean; // if true, all other properties are null
  user_id: number;
  username: string;
  is_verified: boolean;
  profile_picture: string;
  channel_slug: string;
  identity: UserIdentityEventProperty | null;
};

// Helper "override" utilities
export type WithIdentityNull<T extends { identity?: any }> = Omit<T, 'identity'> & { identity: null };
export type WithIdentity<T extends { identity?: any }> = Omit<T, 'identity'> & { identity: UserIdentityEventProperty };

export type EmoteEventProperty = {
  emote_id: string;
  positions: {
    s: number;
    e: number;
  }[];
};

export type LivestreamMetadataEventProperty = {
  title: string;
  language: string;
  has_mature_content: boolean;
  category: CategoryDto;
};
