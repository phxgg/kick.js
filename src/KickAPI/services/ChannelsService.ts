import { BaseResponse } from '../BaseResponse';
import { Channel, ChannelDto } from '../Channel';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { handleError, parseJSON } from '../utils';

export type FetchChannelsResponse = BaseResponse<ChannelDto[]>;

export type UpdateChannelDto = {
  categoryId?: number;
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
   * 1. Provide no parameters (returns information for the currently authenticated user)
   * 2. Provide only `broadcasterUserId` parameters (up to 50)
   * 3. Provide only `slug` parameters (up to 50, each max 25 characters) Note: You cannot mix `broadcasterUserId` and `slug` parameters in the same request.
   *
   * @param options The options for fetching the channel
   * @param options.broadcasterUserId (Optional) Array of broadcaster user IDs (up to 50)
   * @param options.slug (Optional) Array of channel slugs (up to 50, each max 25 characters)
   * @returns An array of Channel instances.
   */
  async fetch({ broadcasterUserId, slug }: { broadcasterUserId?: number[]; slug?: string[] }): Promise<Channel[]> {
    if (broadcasterUserId && broadcasterUserId.length > 0 && slug && slug.length > 0) {
      throw new Error('Cannot mix broadcasterUserId and slug parameters');
    }
    if (broadcasterUserId && broadcasterUserId.length > 50) {
      throw new Error('You can only request up to 50 broadcasterUserId values at a time.');
    }
    if (slug && slug.length > 50) {
      throw new Error('You can only request up to 50 slug values at a time.');
    }
    if (slug && slug.some((s) => s.length > 25)) {
      throw new Error('Each slug can be a maximum of 25 characters long.');
    }

    const endpoint = new URL(this.CHANNELS_URL);
    if (broadcasterUserId && broadcasterUserId.length > 0) {
      endpoint.searchParams.append('broadcaster_user_id', broadcasterUserId.join(' '));
    }
    if (slug && slug.length > 0) {
      slug.forEach((s) => endpoint.searchParams.append('slug', s));
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchChannelsResponse>(response);
    const channels = json.data.map((channel) => new Channel(this.client, channel));
    return channels;
  }

  /**
   * Fetch a channel by its ID.
   *
   * @param id The ID of the channel to fetch
   * @returns The Channel instance.
   */
  async fetchById(id: number): Promise<Channel> {
    return (await this.fetch({ broadcasterUserId: [id] }))[0];
  }

  /**
   * Fetch a channel by its slug.
   *
   * @param slug The slug of the channel to fetch
   * @returns The Channel instance.
   */
  async fetchBySlug(slug: string): Promise<Channel> {
    return (await this.fetch({ slug: [slug] }))[0];
  }

  /**
   * Update the authenticated user's channel information.
   *
   * @param options The options for updating the channel
   * @param options.categoryId (Optional) The ID of the category to set for the channel
   * @param options.customTags (Optional) An array of custom tags to set for the channel
   * @param options.streamTitle (Optional) The title of the stream
   * @returns A promise that resolves when the update is complete
   */
  async update({ categoryId, customTags, streamTitle }: UpdateChannelDto): Promise<void> {
    const endpoint = new URL(this.CHANNELS_URL);

    const response = await fetch(endpoint, {
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
