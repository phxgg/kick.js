import EventEmitter from 'events';

import { MissingScopeError, NoTokenSetError } from './errors.js';
import { eventManager } from './EventManager.js';
import { AppToken, OAuth, Token } from './OAuth.js';
import { User } from './resources/User.js';
import { Scope } from './Scope.js';
import { CategoriesService } from './services/CategoriesService.js';
import { CategoriesServiceV2 } from './services/CategoriesServiceV2.js';
import { ChannelRewardsService } from './services/ChannelRewardsService.js';
import { ChannelsService } from './services/ChannelsService.js';
import { ChatService } from './services/ChatService.js';
import { EventsService } from './services/EventsService.js';
import { KICKsService } from './services/KICKsService.js';
import { LivestreamsService } from './services/LivestreamsService.js';
import { ModerationService } from './services/ModerationService.js';
import { UsersService } from './services/UsersService.js';
import { WebhookEventNames, WebhookEventPayloadMap } from './webhooks/WebhookEvents.js';

export const KICK_BASE_URL = 'https://api.kick.com/public';

export class KickClient {
  private me: User | null = null;
  private eventEmitter = new EventEmitter();

  public token: Token | null = null;
  public appToken: AppToken | null = null;
  public oauth: OAuth;

  // Services
  public categories: CategoriesService;
  public categoriesV2: CategoriesServiceV2;
  public channels: ChannelsService;
  public channelRewards: ChannelRewardsService;
  public users: UsersService;
  public chat: ChatService;
  public moderation: ModerationService;
  public livestreams: LivestreamsService;
  public events: EventsService;
  public kicks: KICKsService;

  constructor(clientId: string, clientSecret: string) {
    this.oauth = new OAuth(this, clientId, clientSecret);
    this.categories = new CategoriesService(this);
    this.categoriesV2 = new CategoriesServiceV2(this);
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
          eventManager.register(this.me!.userId.toString(), this.eventEmitter);
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

  requiresScope(scope: Scope) {
    if (!this.token) {
      throw new NoTokenSetError('No user token set on KickClient.');
    }
    const tokenScopes = this.token.scope ? this.token.scope.split(' ') : [];
    if (!tokenScopes.includes(scope)) {
      throw new MissingScopeError(`Missing required scope: ${scope}`);
    }
  }
}
