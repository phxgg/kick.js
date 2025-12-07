import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type LeaderboardEntry = {
  gifted_amount: number;
  rank: number;
  user_id: number;
  username: string;
};

export type LeaderboardDto = {
  lifetime: LeaderboardEntry[];
  month: LeaderboardEntry[];
  week: LeaderboardEntry[];
};

export class Leaderboard extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: LeaderboardDto
  ) {
    super();
    this.client = client;
  }

  get lifetime(): LeaderboardEntry[] {
    return this.dto.lifetime;
  }

  get month(): LeaderboardEntry[] {
    return this.dto.month;
  }

  get week(): LeaderboardEntry[] {
    return this.dto.week;
  }
}
