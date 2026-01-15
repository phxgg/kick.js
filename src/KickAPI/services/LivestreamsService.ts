import z from 'zod';

import { BaseResponse } from '../BaseResponse';
import { KickClient } from '../KickClient';
import { Livestream, type LivestreamDto, type LivestreamStatsDto } from '../resources/Livestream';
import { constructEndpoint, handleError, parseJSON } from '../utils';
import { Version } from '../Version';

export enum Sort {
  VIEWER_COUNT = 'viewer_count',
  STARTED_AT = 'started_at',
}

export const fetchLivestreamsSchema = z.object({
  broadcasterUserId: z.array(z.number().int().positive()).optional(),
  categoryId: z.number().int().positive().optional(),
  language: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort: z.enum(Sort).optional(),
});
export type FetchLivestreamsParams = z.infer<typeof fetchLivestreamsSchema>;

export type FetchLivestreamsResponse = BaseResponse<LivestreamDto[]>;
export type FetchLivestreamStatsResponse = BaseResponse<LivestreamStatsDto>;

export class LivestreamsService {
  private readonly LIVESTREAMS_URL = constructEndpoint(Version.V1, 'livestreams');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetches livestreams from the Kick API.
   *
   * @param params Parameters for fetching livestreams.
   * @param params.broadcaster_user_id (Optional) Array of broadcaster user IDs to filter by. Max: 50 IDs.
   * @param params.category_id (Optional) Category ID to filter by.
   * @param params.language (Optional) Language code to filter by.
   * @param params.limit (Optional) Maximum number of results to return. Min: 1, Max: 100.
   * @param params.sort (Optional) Sort order.
   * @returns An array of `Livestream` instances.
   */
  async fetch(params: FetchLivestreamsParams): Promise<Livestream[]> {
    const schema = fetchLivestreamsSchema.safeParse(params);

    if (!schema.success) {
      const errorMessages = schema.error.issues.map((issue) => ({
        key: issue.path.join('.'),
        message: issue.message,
      }));
      throw new Error(`Invalid parameters: ${JSON.stringify(errorMessages)}`);
    }

    const { broadcasterUserId, categoryId, language, limit, sort } = schema.data;

    if (broadcasterUserId && broadcasterUserId.length > 50) {
      throw new Error('You can only request up to 50 broadcasterUserId values at a time.');
    }
    if (limit && (limit < 1 || limit > 100)) {
      throw new Error('The limit must be between 1 and 100.');
    }

    const endpoint = new URL(this.LIVESTREAMS_URL);

    if (broadcasterUserId && broadcasterUserId.length > 0) {
      broadcasterUserId.forEach((id) => endpoint.searchParams.append('broadcaster_user_id', String(id)));
    }
    if (categoryId) {
      endpoint.searchParams.append('category_id', String(categoryId));
    }
    if (language) {
      endpoint.searchParams.append('language', language);
    }
    if (limit) {
      endpoint.searchParams.append('limit', String(limit));
    }
    if (sort) {
      endpoint.searchParams.append('sort', sort);
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLivestreamsResponse>(response);
    const livestreams = json.data.map((livestream) => new Livestream(this.client, livestream));
    return livestreams;
  }

  async fetchStats(): Promise<{ total_count: number }> {
    const endpoint = new URL(this.LIVESTREAMS_URL + '/stats');

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLivestreamStatsResponse>(response);
    return json.data;
  }
}
