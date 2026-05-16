import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { Message, MessageDto } from '../resources/Message.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export enum ChatMessageType {
  USER = 'user',
  BOT = 'bot',
}

export const sendMessageSchema = z.object({
  broadcasterUserId: z.number().optional(),
  content: z.string().max(500),
  replyToMessageId: z.string().optional(),
  type: z.enum(ChatMessageType).default(ChatMessageType.BOT),
});
export type SendMessageParams = z.infer<typeof sendMessageSchema>;

export type SendMessageResponse = BaseResponse<MessageDto>;

export class ChatService {
  private readonly CHAT_URL = constructEndpoint(Version.V1, 'chat');
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
   * Required scopes:
   * `chat:write`
   *
   * @param params The parameters for sending a message
   * @param params.broadcasterUserId (Optional) The ID of the broadcaster to whom the message is sent
   * @param params.content The content of the message (max 500 characters)
   * @param params.replyToMessageId (Optional) The ID of the message being replied to
   * @param params.type The type of message (user or bot)
   * @returns The sent `Message` instance.
   */
  async send(params: SendMessageParams): Promise<Message> {
    this.client.requiresScope(Scope.CHAT_WRITE);

    const schema = sendMessageSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid parameters: ${schema.error.message}`);
    }

    const { broadcasterUserId, content, replyToMessageId, type } = schema.data;
    const endpoint = new URL(this.CHAT_URL);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        content: content,
        reply_to_message_id: replyToMessageId,
        type: type,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<SendMessageResponse>(response);
    const message = new Message(this.client, json.data);
    return message;
  }

  /**
   * Delete a chat message from a channel.
   *
   * Required scopes:
   * `moderation:chat_message:manage`
   *
   * @param messageId The ID of the message to delete
   * @returns void
   */
  async delete(messageId: string): Promise<void> {
    this.client.requiresScope(Scope.MODERATION_CHAT_MESSAGE_MANAGE);

    const endpoint = new URL(`${this.CHAT_URL}/${messageId}`);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }
  }
}
