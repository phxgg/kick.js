import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import { UserTokenRequiredError } from '../Errors.js';
import type { KickClient } from '../KickClient.js';
import { RequestOptions } from '../RequestOptions.js';
import { Channel, ChannelDto } from '../resources/Channel.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export type FetchChannelsResponse = BaseResponse<ChannelDto[]>;

export const updateChannelSchema = z.object({
  categoryId: z.number().optional(),
  customTags: z.array(z.string()).optional(),
  streamTitle: z.string().optional(),
});
export type UpdateChannelParams = z.infer<typeof updateChannelSchema>;

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
  private readonly CHANNELS_URL = constructEndpoint(Version.V1, 'channels');
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
   * Required user scopes:
   * `channel:read`
   *
   * @param params The parameters for fetching the channel
   * @param params.broadcasterUserId (Optional) Array of broadcaster user IDs (up to 50)
   * @param params.slug (Optional) Array of channel slugs (up to 50, each max 25 characters)
   * @param options (Optional) Request options
   * @returns An array of `Channel` instances.
   */
  async fetch(params: FetchChannelParamsDto, options?: RequestOptions): Promise<Channel[]> {
    if (this.client.usingUserToken(options?.tokenType)) {
      this.client.requiresUserScope(Scope.CHANNEL_READ);
    }

    const schema = fetchChannelParamsSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, slug } = schema.data;
    const endpoint = new URL(this.CHANNELS_URL);

    if (broadcasterUserId && broadcasterUserId.length > 0) {
      endpoint.searchParams.append('broadcaster_user_id', broadcasterUserId.join(' '));
    }
    if (slug && slug.length > 0) {
      slug.forEach((s) => endpoint.searchParams.append('slug', s));
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
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
   * @param options (Optional) Set `tokenType` to force the user or app token for this call
   * @returns The `Channel` instance.
   */
  async fetchById(id: number, options?: RequestOptions): Promise<Channel> {
    return (await this.fetch({ broadcasterUserId: [id] }, options))[0];
  }

  /**
   * Fetch a channel by its slug.
   *
   * @param slug The slug of the channel to fetch
   * @param options (Optional) Set `tokenType` to force the user or app token for this call
   * @returns The `Channel` instance.
   */
  async fetchBySlug(slug: string, options?: RequestOptions): Promise<Channel> {
    return (await this.fetch({ slug: [slug] }, options))[0];
  }

  /**
   * Update the authenticated user's channel information.
   *
   * Required user scopes:
   * `channel:write`
   *
   * @param params The parameters for updating the channel
   * @param params.categoryId (Optional) The ID of the category to set for the channel
   * @param params.customTags (Optional) An array of custom tags to set for the channel
   * @param params.streamTitle (Optional) The title of the stream
   * @param options (Optional) Request options
   */
  async update(params: UpdateChannelParams, options?: RequestOptions): Promise<void> {
    if (!this.client.usingUserToken(options?.tokenType)) {
      throw new UserTokenRequiredError('Updating channel information requires a user access token.');
    }

    this.client.requiresUserScope(Scope.CHANNEL_WRITE);

    const schema = updateChannelSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { categoryId, customTags, streamTitle } = schema.data;
    const endpoint = new URL(this.CHANNELS_URL);

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.client.authToken('user')}`,
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
