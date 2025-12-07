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

  get backgroundColor() {
    return this.dto.background_color;
  }

  get cost() {
    return this.dto.cost;
  }

  get description() {
    return this.dto.description;
  }

  get id() {
    return this.dto.id;
  }

  get isEnabled() {
    return this.dto.is_enabled;
  }

  get isPaused() {
    return this.dto.is_paused;
  }

  get isUserInputRequired() {
    return this.dto.is_user_input_required;
  }

  get shouldRedemptionsSkipRequestQueue() {
    return this.dto.should_redemptions_skip_request_queue;
  }

  get title() {
    return this.dto.title;
  }
}
