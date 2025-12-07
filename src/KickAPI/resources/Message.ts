import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type MessageDto = {
  is_sent: boolean;
  message_id: string;
};

export class Message extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: MessageDto
  ) {
    super();
    this.client = client;
  }

  get isSent() {
    return this.dto.is_sent;
  }

  get messageId() {
    return this.dto.message_id;
  }
}
