import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Livestream, type LivestreamDto } from '../Livestream';
import { handleError, parseJSON } from '../utils';

export enum Sort {
  VIEWER_COUNT = 'viewer_count',
  STARTED_AT = 'started_at',
}

export type FetchLivestreamsParams = {
  broadcaster_user_id?: number[];
  category_id?: number;
  language?: string;
  limit?: number;
  sort?: Sort;
};

export type FetchLivestreamsResponse = BaseResponse<LivestreamDto[]>;

export class LivestreamsService {
  private LIVESTREAMS_URL: string = KICK_BASE_URL + '/livestreams';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetches livestreams from the Kick API.
   *
   * @param options Options for fetching livestreams.
   * @param options.broadcaster_user_id (Optional) Array of broadcaster user IDs to filter by. Max: 50 IDs.
   * @param options.category_id (Optional) Category ID to filter by.
   * @param options.language (Optional) Language code to filter by.
   * @param options.limit (Optional) Maximum number of results to return. Min: 1, Max: 100.
   * @param options.sort (Optional) Sort order.
   * @returns An array of Livestream instances.
   */
  async fetch({
    broadcaster_user_id,
    category_id,
    language,
    limit,
    sort,
  }: FetchLivestreamsParams): Promise<Livestream[]> {
    if (broadcaster_user_id && broadcaster_user_id.length > 50) {
      throw new Error('You can only request up to 50 broadcaster_user_id values at a time.');
    }
    if (limit && (limit < 1 || limit > 100)) {
      throw new Error('The limit must be between 1 and 100.');
    }

    const url = new URL(this.LIVESTREAMS_URL);
    if (broadcaster_user_id && broadcaster_user_id.length > 0) {
      broadcaster_user_id.forEach((id) => url.searchParams.append('broadcaster_user_id', String(id)));
    }
    if (category_id) {
      url.searchParams.append('category_id', String(category_id));
    }
    if (language) {
      url.searchParams.append('language', language);
    }
    if (limit) {
      url.searchParams.append('limit', String(limit));
    }
    if (sort) {
      url.searchParams.append('sort', sort);
    }

    const response = await fetch(url.toString(), {
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
}
