import { Category, type CategoryDto } from './Category';
import { KickClient } from './KickClient';
import { Serializable } from './Serializable';

export type LivestreamDto = {
  broadcaster_user_id: number;
  category: CategoryDto;
  channel_id: number;
  has_mature_content: boolean;
  language: string;
  slug: string;
  started_at: string;
  stream_title: string;
  thumbnail: string;
  viewer_count: number;
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

  get category(): CategoryDto {
    return new Category(this.client, this.dto.category);
  }

  get channelId(): number {
    return this.dto.channel_id;
  }

  get hasMatureContent(): boolean {
    return this.dto.has_mature_content;
  }

  get language(): string {
    return this.dto.language;
  }

  get slug(): string {
    return this.dto.slug;
  }

  get startedAt(): string {
    return this.dto.started_at;
  }

  get streamTitle(): string {
    return this.dto.stream_title;
  }

  get thumbnail(): string {
    return this.dto.thumbnail;
  }

  get viewerCount(): number {
    return this.dto.viewer_count;
  }
}
