import { Category, type CategoryDto } from './Category';
import { KickClient } from './Client';
import { Message } from './Message';
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

export class Channel {
  client: KickClient;

  banner_picture: string;
  broadcaster_user_id: number;
  category: Category;
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

  constructor(
    client: KickClient,
    { banner_picture, broadcaster_user_id, category, channel_description, slug, stream, stream_title }: ChannelDto,
  ) {
    this.client = client;
    this.banner_picture = banner_picture;
    this.broadcaster_user_id = broadcaster_user_id;
    this.category = new Category(this.client, category);
    this.channel_description = channel_description;
    this.slug = slug;
    this.stream = stream;
    this.stream_title = stream_title;
  }

  async send(content: string): Promise<Message> {
    return await this.client.chat.send({
      broadcasterUserId: this.broadcaster_user_id,
      content,
      type: ChatMessageType.BOT,
    });
  }
}
