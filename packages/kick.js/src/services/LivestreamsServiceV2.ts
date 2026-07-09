import z from 'zod';

import { BaseResponse, BaseResponseWithPagination } from '../BaseResponse.js';
import { LivestreamV2, type LivestreamV2Dto, type LivestreamV2StatsDto } from '../index.js';
import type { KickClient } from '../KickClient.js';
import { RequestOptions } from '../RequestOptions.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export const fetchLivestreamsV2Schema = z.object({
  categoryId: z.array(z.number().int().positive()).optional(),
  language_code: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  cursor: z.string().optional(),
});
export type FetchLivestreamsV2Params = z.infer<typeof fetchLivestreamsV2Schema>;

export const fetchByUsersSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1).max(100),
});
export type FetchByUsersParams = z.infer<typeof fetchByUsersSchema>;

export type FetchLivestreamsV2Response = BaseResponseWithPagination<LivestreamV2Dto[]>;
export type FetchLivestreamStatsResponse = BaseResponse<LivestreamV2StatsDto>;

export class LivestreamsServiceV2 {
  private readonly LIVESTREAMS_URL = constructEndpoint(Version.V2, 'livestreams');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetches livestreams from the Kick API.
   *
   * @param params Parameters for fetching livestreams.
   * @param params.category_id (Optional) Category ID to filter by.
   * @param params.language_code (Optional) Array of language codes to filter by.
   * @param params.limit (Optional) Maximum number of results to return. Min: 1, Max: 1000.
   * @param params.cursor (Optional) Cursor for pagination.
   * @param options (Optional) Request options.
   * @returns An array of `LivestreamV2` instances.
   */
  async fetch(params: FetchLivestreamsV2Params, options?: RequestOptions): Promise<LivestreamV2[]> {
    const schema = fetchLivestreamsV2Schema.safeParse(params);

    if (!schema.success) {
      const errorMessages = schema.error.issues.map((issue) => ({
        key: issue.path.join('.'),
        message: issue.message,
      }));
      throw new Error(`Invalid parameters: ${JSON.stringify(errorMessages)}`);
    }

    const { categoryId, language_code, limit, cursor } = schema.data;

    if (limit && (limit < 1 || limit > 1000)) {
      throw new Error('The limit must be between 1 and 1000.');
    }

    const endpoint = new URL(this.LIVESTREAMS_URL);

    if (categoryId && categoryId.length > 0) {
      categoryId.forEach((id) => endpoint.searchParams.append('category_id', String(id)));
    }
    if (language_code && language_code.length > 0) {
      language_code.forEach((code) => endpoint.searchParams.append('language_code', code));
    }
    if (limit) {
      endpoint.searchParams.append('limit', String(limit));
    }
    if (cursor) {
      endpoint.searchParams.append('cursor', cursor);
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLivestreamsV2Response>(response);
    const livestreams = json.data.map((livestream) => new LivestreamV2(this.client, livestream));
    return livestreams;
  }

  async fetchStats(options?: RequestOptions): Promise<{ total_count: number }> {
    const endpoint = new URL(this.LIVESTREAMS_URL.replace(`/${Version.V2}/`, `/${Version.V1}/`) + '/stats');

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLivestreamStatsResponse>(response);
    return json.data;
  }

  async fetchByUsers(params: FetchByUsersParams, options?: RequestOptions): Promise<LivestreamV2[]> {
    const schema = fetchByUsersSchema.safeParse(params);

    if (!schema.success) {
      const errorMessages = schema.error.issues.map((issue) => ({
        key: issue.path.join('.'),
        message: issue.message,
      }));
      throw new Error(`Invalid parameters: ${JSON.stringify(errorMessages)}`);
    }

    const { userIds: ids } = schema.data;

    const endpoint = new URL(constructEndpoint(Version.V1, 'users/livestreams'));

    ids.forEach((id) => endpoint.searchParams.append('user_id', String(id)));

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.authToken(options?.tokenType)}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLivestreamsV2Response>(response);
    const livestreams = json.data.map((livestream) => new LivestreamV2(this.client, livestream));
    return livestreams;
  }
}
