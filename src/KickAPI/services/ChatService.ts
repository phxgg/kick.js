import { KICK_BASE_URL, KickClient } from '../Client';
import { Message } from '../Message';

export enum ChatMessageType {
  USER = 'user',
  BOT = 'bot',
}

export type SendMessageDto = {
  broadcasterUserId?: number | string;
  content: string;
  replyToMessageId?: string;
  type: ChatMessageType;
};

export type SendMessageResponse = {
  data: {
    is_sent: boolean;
    message_id: string;
  };
  message: string;
};

export class ChatService {
  private CHAT_URL: string = KICK_BASE_URL + '/chat';
  private client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  async send({
    broadcasterUserId,
    content,
    replyToMessageId,
    type = ChatMessageType.BOT,
  }: SendMessageDto): Promise<Message> {
    if (content.length > 500) {
      throw new Error('Message content exceeds maximum length of 500 characters');
    }
    const response = await fetch(this.CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ broadcasterUserId, content, replyToMessageId, type }),
    });
    if (!response.ok) {
      // FIXME: keeps failing
      console.log(response.status, response.statusText);
      throw new Error('Failed to send chat message');
    }
    const json = (await response.json()) as SendMessageResponse;
    const data = new Message(json.data);
    return data;
  }
}
