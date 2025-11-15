import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Leaderboard, type LeaderboardDto } from '../Leaderboard';
import { handleError, parseJSON } from '../utils';

export enum Sort {
  VIEWER_COUNT = 'viewer_count',
  STARTED_AT = 'started_at',
}

export type FetchLeaderboardParams = {
  top?: number;
};

export type FetchLeaderboardResponse = BaseResponse<LeaderboardDto>;

export class KICKsService {
  private KICKS_URL: string = KICK_BASE_URL + '/kicks';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Fetches livestreams from the Kick API.
   *
   * @param options Options for fetching livestreams.
   * @param options.top (Optional) The number of entries from the top of the leaderboard to return. For example, 10 will fetch the top 10 entries.
   * @returns A Leaderboard instance.
   */
  async fetchLeaderboard({ top }: FetchLeaderboardParams): Promise<Leaderboard> {
    if (top && (top < 1 || top > 100)) {
      throw new Error('You can only request up to 100 top values at a time.');
    }

    const response = await fetch(`${this.KICKS_URL}/leaderboard`, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchLeaderboardResponse>(response);
    const leaderboard = new Leaderboard(this.client, json.data);
    return leaderboard;
  }
}
