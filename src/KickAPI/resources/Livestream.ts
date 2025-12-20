import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';
import { Category, type CategoryDto } from './Category';

export type LivestreamDto = {
  broadcaster_user_id: number;
  category: CategoryDto;
  channel_id: number;
  custom_tags: string[];
  has_mature_content: boolean;
  language: string;
  profile_picture: string;
  slug: string;
  started_at: string;
  stream_title: string;
  thumbnail: string;
  viewer_count: number;
};

export type LivestreamStatsDto = {
  total_count: number;
};

export class Livestream extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: LivestreamDto
  ) {
    super();
    this.client = client;
  }

  get broadcasterUserId(): number {
    return this.dto.broadcaster_user_id;
  }

  get category() {
    return new Category(this.client, this.dto.category);
  }

  get channelId(): number {
    return this.dto.channel_id;
  }

  get customTags(): string[] {
    return this.dto.custom_tags;
  }

  get hasMatureContent(): boolean {
    return this.dto.has_mature_content;
  }

  get language(): string {
    return this.dto.language;
  }

  get profilePicture(): URL {
    return new URL(this.dto.profile_picture);
  }

  get slug(): string {
    return this.dto.slug;
  }

  get startedAt(): Date {
    return new Date(this.dto.started_at);
  }

  get streamTitle(): string {
    return this.dto.stream_title;
  }

  get thumbnail(): URL {
    return new URL(this.dto.thumbnail);
  }

  get viewerCount(): number {
    return this.dto.viewer_count;
  }
}
