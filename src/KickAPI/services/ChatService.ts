import { BaseResponse } from '../BaseResponse';
import { handleError } from '../errors';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Message, MessageDto } from '../Message';

export enum ChatMessageType {
  USER = 'user',
  BOT = 'bot',
}

export type SendMessageDto = {
  broadcasterUserId?: number;
  content: string;
  replyToMessageId?: string;
  type: ChatMessageType;
};

export type SendMessageResponse = BaseResponse<MessageDto>;

export class ChatService {
  private readonly CHAT_URL: string = KICK_BASE_URL + '/chat';
  protected readonly client: KickClient;

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
      body: JSON.stringify({
        broadcaster_user_id: Number(broadcasterUserId),
        content,
        reply_to_message_id: replyToMessageId,
        type,
      }),
    });
    if (!response.ok) {
      handleError(response);
    }
    const json = (await response.json()) as SendMessageResponse;
    const message = new Message(this.client, json.data);
    return message;
  }
}
