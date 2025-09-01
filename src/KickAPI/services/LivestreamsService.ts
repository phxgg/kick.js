import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';
import { Livestream, type LivestreamDto } from '../Livestream';

export enum Sort {
  VIEWER_COUNT = 'viewer_count',
  STARTED_AT = 'started_at',
}

export type FetchLivestreamsParams = {
  broadcaster_user_id?: (number | string)[];
  category_id?: number | string;
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

  async fetch({
    broadcaster_user_id,
    category_id,
    language,
    limit,
    sort,
  }: FetchLivestreamsParams): Promise<Livestream[]> {
    const url = new URL(this.LIVESTREAMS_URL);
    if (broadcaster_user_id) {
      url.searchParams.append(
        'broadcaster_user_id',
        Array.isArray(broadcaster_user_id) ? broadcaster_user_id.join(' ') : String(broadcaster_user_id),
      );
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
    const json = (await response.json()) as FetchLivestreamsResponse;
    const livestreams = json.data.map((livestream) => new Livestream(this.client, livestream));
    return livestreams;
  }
}
