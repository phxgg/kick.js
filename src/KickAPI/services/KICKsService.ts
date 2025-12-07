import z from 'zod';

import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Leaderboard, type LeaderboardDto } from '../resources/Leaderboard';
import { handleError, parseJSON } from '../utils';

export const fetchLeaderboardSchema = z.object({
  top: z.number().int().min(1).max(100).optional(),
});
export type FetchLeaderboardParams = z.infer<typeof fetchLeaderboardSchema>;

export type FetchLeaderboardResponse = BaseResponse<LeaderboardDto>;

export class KICKsService {
  private KICKS_URL: string = KICK_BASE_URL + '/kicks';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Gets the KICKs leaderboard for the authenticated broadcaster.
   *
   * Required scopes:
   * `kicks:read`
   *
   * @param options Options for fetching leaderboard.
   * @param options.top (Optional) The number of entries from the top of the leaderboard to return. For example, 10 will fetch the top 10 entries.
   * @returns A `Leaderboard` instance.
   */
  async fetchLeaderboard({ top }: FetchLeaderboardParams): Promise<Leaderboard> {
    const schema = fetchLeaderboardSchema.safeParse({ top });

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.KICKS_URL + '/leaderboard');

    if (schema.data.top) {
      endpoint.searchParams.append('top', schema.data.top.toString());
    }

    const response = await fetch(endpoint, {
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
