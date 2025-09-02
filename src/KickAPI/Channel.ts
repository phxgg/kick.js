import { Category, type CategoryDto } from './Category';
import { KickClient } from './Client';
import { Message } from './Message';
import { Serializable } from './Serializable';
import { ChatMessageType } from './services/ChatService';

export type ChannelDto = {
  banner_picture: string;
  broadcaster_user_id: number;
  category: CategoryDto;
  channel_description: string;
  slug: string;
  stream: {
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

  get bannerPicture() {
    return this.dto.banner_picture;
  }

  get broadcasterUserId() {
    return this.dto.broadcaster_user_id;
  }

  get category() {
    return new Category(this.client, this.dto.category);
  }

  get channelDescription() {
    return this.dto.channel_description;
  }

  get slug() {
    return this.dto.slug;
  }

  get stream() {
    return {
      isLive: this.dto.stream.is_live,
      isMature: this.dto.stream.is_mature,
      key: this.dto.stream.key,
      language: this.dto.stream.language,
      startTime: this.dto.stream.start_time,
      thumbnail: this.dto.stream.thumbnail,
      url: this.dto.stream.url,
      viewerCount: this.dto.stream.viewer_count,
    };
  }

  get streamTitle() {
    return this.dto.stream_title;
  }

  async send(content: string): Promise<Message> {
    return await this.client.chat.send({
      broadcasterUserId: this.dto.broadcaster_user_id,
      content,
      type: ChatMessageType.BOT,
    });
  }
}
