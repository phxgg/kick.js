import { KickClient } from './Client';

export type MessageDto = {
  is_sent: boolean;
  message_id: string;
};

export class Message {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: MessageDto,
  ) {
    this.client = client;
  }

  get isSent() {
    return this.dto.is_sent;
  }

  get messageId() {
    return this.dto.message_id;
  }
}
