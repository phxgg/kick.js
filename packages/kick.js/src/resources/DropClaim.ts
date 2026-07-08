import type { KickClient } from '../KickClient.js';
import { Serializable } from '../Serializable.js';

export type DropClaimDto = {
  claim_id: string;
  user_id: number;
  campaign_id: string;
  reward_id: string;
  external_id: string;
  external_status: string;
  created_at: string;
  updated_at: string;
};

export class DropClaim extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: DropClaimDto
  ) {
    super();
    this.client = client;
  }

  get claimId(): string {
    return this.dto.claim_id;
  }

  get userId(): number {
    return this.dto.user_id;
  }

  get campaignId(): string {
    return this.dto.campaign_id;
  }

  get rewardId(): string {
    return this.dto.reward_id;
  }

  get externalId(): string {
    return this.dto.external_id;
  }

  get externalStatus(): string {
    return this.dto.external_status;
  }

  get createdAt(): Date {
    return new Date(this.dto.created_at);
  }

  get updatedAt(): Date {
    return new Date(this.dto.updated_at);
  }
}
