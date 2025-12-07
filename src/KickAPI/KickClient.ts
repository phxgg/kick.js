import EventEmitter from 'events';

import { eventManager } from './EventManager';
import { AppToken, OAuth, Token } from './OAuth';
import { CategoriesService } from './services/CategoriesService';
import { ChannelRewardsService } from './services/ChannelRewardsService';
import { ChannelsService } from './services/ChannelsService';
import { ChatService } from './services/ChatService';
import { EventsService } from './services/EventsService';
import { KICKsService } from './services/KICKsService';
import { LivestreamsService } from './services/LivestreamsService';
import { ModerationService } from './services/ModerationService';
import { UsersService } from './services/UsersService';
import { User } from './User';
import { WebhookEventNames, WebhookEventPayloadMap } from './webhooks/WebhookEvents';

export const KICK_BASE_URL: string = 'https://api.kick.com/public/v1';

export enum Scope {
  USER_READ = 'user:read',
  CHANNEL_READ = 'channel:read',
  CHANNEL_WRITE = 'channel:write',
  CHANNEL_REWARDS_READ = 'channel:rewards:read',
  CHANNEL_REWARDS_WRITE = 'channel:rewards:write',
  CHAT_WRITE = 'chat:write',
  STREAMKEY_READ = 'streamkey:read',
  EVENTS_SUBSCRIBE = 'events:subscribe',
  MODERATION_BAN = 'moderation:ban',
  MODERATION_CHAT_MESSAGE_MANAGE = 'moderation:chat_message:manage',
  KICKS_READ = 'kicks:read',
}

export class KickClient {
  private me: User | null = null;
  private eventEmitter = new EventEmitter();

  public token: Token | null = null;
  public appToken: AppToken | null = null;
  public oauth: OAuth;

  // Services
  public categories: CategoriesService;
  public channels: ChannelsService;
  public channelRewards: ChannelRewardsService;
  public users: UsersService;
  public chat: ChatService;
  public moderation: ModerationService;
  public livestreams: LivestreamsService;
  public events: EventsService;
  public kicks: KICKsService;

  constructor(clientId: string, clientSecret: string) {
    this.oauth = OAuth.getInstance(clientId, clientSecret);
    this.categories = new CategoriesService(this);
    this.channels = new ChannelsService(this);
    this.channelRewards = new ChannelRewardsService(this);
    this.users = new UsersService(this);
    this.chat = new ChatService(this);
    this.moderation = new ModerationService(this);
    this.livestreams = new LivestreamsService(this);
    this.events = new EventsService(this);
    this.kicks = new KICKsService(this);
  }

  setToken(token: Token) {
    this.token = token;
    // register event emitter in the global event manager
    if (!this.me) {
      this.users
        .me()
        .then((me) => {
          this.me = me;
          eventManager.register(this.me.userId.toString(), this.eventEmitter);
        })
        .catch((err) => {
          console.error('Failed to fetch authenticated user for KickClient:', err);
        });
    }
  }

  destroy() {
    if (this.me) {
      eventManager.destroy(this.me.userId.toString());
    }
  }

  on<E extends WebhookEventNames>(event: E, listener: (payload: WebhookEventPayloadMap[E]) => void) {
    this.eventEmitter.on(event, listener);
  }

  off<E extends WebhookEventNames>(event: E, listener: (payload: WebhookEventPayloadMap[E]) => void) {
    this.eventEmitter.off(event, listener);
  }

  once<E extends WebhookEventNames>(event: E, listener: (payload: WebhookEventPayloadMap[E]) => void) {
    this.eventEmitter.once(event, listener);
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners();
  }
}
