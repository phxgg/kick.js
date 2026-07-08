import type { KickClient } from '../KickClient.js';
import { Serializable } from '../Serializable.js';

type LivestreamUserDto = {
  id: number;
  profile_picture: string;
  username: string;
};

type LivestreamCategoryDto = {
  id: number;
  name: string;
  thumbnail: string;
};

type LivestreamChannelDto = {
  slug: string;
};

export type LivestreamV2Dto = {
  broadcaster_user: LivestreamUserDto;
  category: LivestreamCategoryDto;
  channel: LivestreamChannelDto;
  has_mature_content: boolean;
  id: string;
  language_code: string;
  started_at: string;
  tags: string[];
  thumbnail: string;
  title: string;
  viewer_count: number;
};

export type LivestreamV2StatsDto = {
  total_count: number;
};

export class LivestreamV2 extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: LivestreamV2Dto
  ) {
    super();
    this.client = client;
  }

  get broadcasterUser(): LivestreamUserDto {
    return this.dto.broadcaster_user;
  }

  get category(): LivestreamCategoryDto {
    return this.dto.category;
  }

  get channel(): LivestreamChannelDto {
    return this.dto.channel;
  }

  get hasMatureContent(): boolean {
    return this.dto.has_mature_content;
  }

  get id(): string {
    return this.dto.id;
  }

  get languageCode(): string {
    return this.dto.language_code;
  }

  get startedAt(): Date {
    return new Date(this.dto.started_at);
  }

  get tags(): string[] {
    return this.dto.tags;
  }

  get thumbnail(): URL {
    return new URL(this.dto.thumbnail);
  }

  get title(): string {
    return this.dto.title;
  }

  get viewerCount(): number {
    return this.dto.viewer_count;
  }
}
