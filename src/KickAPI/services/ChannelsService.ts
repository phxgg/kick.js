import { BaseResponse } from '../BaseResponse';
import { Channel, ChannelDto } from '../Channel';
import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';

export type FetchChannelsResponse = BaseResponse<ChannelDto[]>;

export type UpdateChannelDto = {
  categoryId: number | string;
  customTags?: string[];
  streamTitle?: string;
};

export class ChannelsService {
  private readonly CHANNELS_URL: string = KICK_BASE_URL + '/channels';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Retrieve channel information based on provided broadcaster user IDs or channel slugs. You can either:
   * Provide no parameters (returns information for the currently authenticated user)
   * Provide only `broadcasterUserId` parameters (up to 50)
   * Provide only `slug` parameters (up to 50, each max 25 characters) Note: You cannot mix `broadcasterUserId` and `slug` parameters in the same request.
   * @param options The options for fetching the channel
   */
  async fetch({
    broadcasterUserId,
    slug,
  }: {
    broadcasterUserId?: (number | string)[];
    slug?: string[];
  }): Promise<Channel[]> {
    const url = new URL(this.CHANNELS_URL);
    if (broadcasterUserId && broadcasterUserId.length > 0 && slug && slug.length > 0) {
      throw new Error('Cannot mix broadcasterUserId and slug parameters');
    }
    if (broadcasterUserId && broadcasterUserId.length > 0) {
      url.searchParams.append('broadcaster_user_id', broadcasterUserId.join(' '));
    }
    if (slug && slug.length > 0) {
      slug.forEach((s) => url.searchParams.append('slug', s));
    }
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      handleError(response);
    }
    const json = (await response.json()) as FetchChannelsResponse;
    const channels = json.data.map((channel) => new Channel(this.client, channel));
    return channels;
  }

  async fetchById(id: number | string): Promise<Channel> {
    return (await this.fetch({ broadcasterUserId: [id] }))[0];
  }

  async fetchBySlug(slug: string): Promise<Channel> {
    return (await this.fetch({ slug: [slug] }))[0];
  }

  async update({ categoryId, customTags, streamTitle }: UpdateChannelDto): Promise<void> {
    const response = await fetch(this.CHANNELS_URL, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_id: categoryId,
        custom_tags: customTags,
        stream_title: streamTitle,
      }),
    });
    if (!response.ok) {
      handleError(response);
    }
  }
}
