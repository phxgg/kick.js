import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { Message, MessageDto } from '../Message';
import { handleError, parseJSON } from '../utils';

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

  /**
   * Post a chat message to a channel as a user or a bot.
   * When sending as a user, the broadcaster_user_id is required.
   * Whereas when sending as a bot, the broadcaster_user_id is not required and is ignored.
   * As a bot, the message will always be sent to the channel attached to your token.
   *
   * @param options The options for sending a message
   * @param options.broadcasterUserId (Optional) The ID of the broadcaster to whom the message is sent
   * @param options.content The content of the message (max 500 characters)
   * @param options.replyToMessageId (Optional) The ID of the message being replied to
   * @param options.type The type of message (user or bot)
   * @returns The sent Message instance.
   */
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

    const json = await parseJSON<SendMessageResponse>(response);
    const message = new Message(this.client, json.data);
    return message;
  }
}
