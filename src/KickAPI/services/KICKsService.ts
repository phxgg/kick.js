import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { Leaderboard, type LeaderboardDto } from '../resources/Leaderboard.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export const fetchLeaderboardSchema = z.object({
  top: z.number().int().min(1).max(100).optional(),
});
export type FetchLeaderboardParams = z.infer<typeof fetchLeaderboardSchema>;

export type FetchLeaderboardResponse = BaseResponse<LeaderboardDto>;

export class KICKsService {
  private readonly KICKS_URL = constructEndpoint(Version.V1, 'kicks');
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
   * @param params Parameters for fetching leaderboard.
   * @param params.top (Optional) The number of entries from the top of the leaderboard to return. For example, 10 will fetch the top 10 entries.
   * @returns A `Leaderboard` instance.
   */
  async fetchLeaderboard(params: FetchLeaderboardParams): Promise<Leaderboard> {
    this.client.requiresScope(Scope.KICKS_READ);

    const schema = fetchLeaderboardSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { top } = schema.data;
    const endpoint = new URL(this.KICKS_URL + '/leaderboard');

    if (top) {
      endpoint.searchParams.append('top', top.toString());
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
