import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type ChannelRewardDto = {
  background_color: string;
  cost: number;
  description: string;
  id: string;
  is_enabled: boolean;
  is_paused: boolean;
  is_user_input_required: boolean;
  should_redemptions_skip_request_queue: boolean;
  title: string;
};

export class ChannelReward extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: ChannelRewardDto
  ) {
    super();
    this.client = client;
  }

  get backgroundColor(): string {
    return this.dto.background_color;
  }

  get cost(): number {
    return this.dto.cost;
  }

  get description(): string {
    return this.dto.description;
  }

  get id(): string {
    return this.dto.id;
  }

  get isEnabled(): boolean {
    return this.dto.is_enabled;
  }

  get isPaused(): boolean {
    return this.dto.is_paused;
  }

  get isUserInputRequired(): boolean {
    return this.dto.is_user_input_required;
  }

  get shouldRedemptionsSkipRequestQueue(): boolean {
    return this.dto.should_redemptions_skip_request_queue;
  }

  get title(): string {
    return this.dto.title;
  }
}
