import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';
import { ChatMessageType } from '../services/ChatService';
import { Category, type CategoryDto } from './Category';
import { Message } from './Message';

export type ChannelDto = {
  banner_picture: string;
  broadcaster_user_id: number;
  category: CategoryDto;
  channel_description: string;
  slug: string;
  stream: {
    custom_tags: string[];
    is_live: boolean;
    is_mature: boolean;
    key: string;
    language: string;
    start_time: string;
    thumbnail: string;
    url: string;
    viewer_count: number;
  };
  stream_title: string;
};

export class Channel extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: ChannelDto
  ) {
    super();
    this.client = client;
  }

  get bannerPicture(): URL {
    return new URL(this.dto.banner_picture);
  }

  get broadcasterUserId(): number {
    return this.dto.broadcaster_user_id;
  }

  get category(): Category {
    return new Category(this.client, this.dto.category);
  }

  get channelDescription(): string {
    return this.dto.channel_description;
  }

  get slug(): string {
    return this.dto.slug;
  }

  get stream() {
    return {
      customTags: this.dto.stream.custom_tags,
      isLive: this.dto.stream.is_live,
      isMature: this.dto.stream.is_mature,
      key: this.dto.stream.key,
      language: this.dto.stream.language,
      startTime: new Date(this.dto.stream.start_time),
      thumbnail: new URL(this.dto.stream.thumbnail),
      url: this.dto.stream.url,
      viewerCount: this.dto.stream.viewer_count,
    };
  }

  get streamTitle(): string {
    return this.dto.stream_title;
  }

  async send(content: string, type = ChatMessageType.BOT): Promise<Message> {
    return await this.client.chat.send({
      broadcasterUserId: this.broadcasterUserId,
      content,
      type,
    });
  }
}
