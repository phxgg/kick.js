import z from 'zod';

import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Channel, ChannelDto } from '../resources/Channel';
import { Scopes } from '../Scopes';
import { handleError, parseJSON } from '../utils';

export type FetchChannelsResponse = BaseResponse<ChannelDto[]>;

export const updateChannelSchema = z.object({
  categoryId: z.number().optional(),
  customTags: z.array(z.string()).optional(),
  streamTitle: z.string().optional(),
});
export type UpdateChannelDto = z.infer<typeof updateChannelSchema>;

export const fetchChannelParamsSchema = z
  .object({
    broadcasterUserId: z.array(z.number()).max(50).optional(),
    slug: z.array(z.string().max(25)).max(50).optional(),
  })
  .refine(
    (data) => {
      // Cannot mix broadcasterUserId and slug
      if (data.broadcasterUserId && data.slug) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot mix broadcasterUserId and slug parameters',
    }
  );
export type FetchChannelParamsDto = z.infer<typeof fetchChannelParamsSchema>;

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
   * Required scopes:
   * `channel:read`
   *
   * @param options The options for fetching the channel
   * @param options.broadcasterUserId (Optional) Array of broadcaster user IDs (up to 50)
   * @param options.slug (Optional) Array of channel slugs (up to 50, each max 25 characters)
   * @returns An array of `Channel` instances.
   */
  async fetch({ broadcasterUserId, slug }: FetchChannelParamsDto): Promise<Channel[]> {
    this.client.requiresScope(Scopes.CHANNEL_READ);

    const schema = fetchChannelParamsSchema.safeParse({
      broadcasterUserId,
      slug,
    });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.CHANNELS_URL);

    if (schema.data.broadcasterUserId && schema.data.broadcasterUserId.length > 0) {
      endpoint.searchParams.append('broadcaster_user_id', schema.data.broadcasterUserId.join(' '));
    }
    if (schema.data.slug && schema.data.slug.length > 0) {
      schema.data.slug.forEach((s) => endpoint.searchParams.append('slug', s));
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
   * @returns The `Channel` instance.
   */
  async fetchById(id: number): Promise<Channel> {
    return (await this.fetch({ broadcasterUserId: [id] }))[0];
  }

  /**
   * Fetch a channel by its slug.
   *
   * @param slug The slug of the channel to fetch
   * @returns The `Channel` instance.
   */
  async fetchBySlug(slug: string): Promise<Channel> {
    return (await this.fetch({ slug: [slug] }))[0];
  }

  /**
   * Update the authenticated user's channel information.
   *
   * Required scopes:
   * `channel:write`
   *
   * @param options The options for updating the channel
   * @param options.categoryId (Optional) The ID of the category to set for the channel
   * @param options.customTags (Optional) An array of custom tags to set for the channel
   * @param options.streamTitle (Optional) The title of the stream
   * @returns void
   */
  async update({ categoryId, customTags, streamTitle }: UpdateChannelDto): Promise<void> {
    this.client.requiresScope(Scopes.CHANNEL_WRITE);

    const schema = updateChannelSchema.safeParse({
      categoryId,
      customTags,
      streamTitle,
    });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

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
