export type MessageDto = {
  is_sent: boolean;
  message_id: string;
};

export class Message {
  is_sent: boolean;
  message_id: string;

  constructor({ is_sent, message_id }: MessageDto) {
    this.is_sent = is_sent;
    this.message_id = message_id;
  }
}
