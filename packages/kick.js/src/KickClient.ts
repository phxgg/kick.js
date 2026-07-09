import EventEmitter from 'events';

import { MissingScopeError, NoTokenSetError } from './Errors.js';
import { eventManager } from './EventManager.js';
import { AppToken, OAuth, Token } from './OAuth.js';
import { Scope } from './Scope.js';
import { CategoriesService } from './services/CategoriesService.js';
import { CategoriesServiceV2 } from './services/CategoriesServiceV2.js';
import { ChannelRewardsService } from './services/ChannelRewardsService.js';
import { ChannelsService } from './services/ChannelsService.js';
import { ChatService } from './services/ChatService.js';
import { DropsService } from './services/DropsService.js';
import { EventsService } from './services/EventsService.js';
import { KICKsService } from './services/KICKsService.js';
import { LivestreamsService } from './services/LivestreamsService.js';
import { LivestreamsServiceV2 } from './services/LivestreamsServiceV2.js';
import { ModerationService } from './services/ModerationService.js';
import { UsersService } from './services/UsersService.js';
import { WebhookEventNames, WebhookEventPayloadMap } from './webhooks/WebhookEvents.js';

export const KICK_BASE_URL = 'https://api.kick.com/public';

export interface KickClientOptions {
  clientId: string;
  clientSecret: string;
  /** OAuth redirect URI. Required only for `oauth.generateAuthorizeURL()` and `oauth.exchangeToken()`. */
  redirectUri?: string;
}

export class KickClient {
  private eventEmitter = new EventEmitter();
  private registeredBroadcasterIds = new Set<string>();

  public token: Token | null = null;
  public appToken: AppToken | null = null;
  public oauth: OAuth;

  // Services
  public categories: CategoriesService;
  public categoriesV2: CategoriesServiceV2;
  public channels: ChannelsService;
  public channelRewards: ChannelRewardsService;
  public chat: ChatService;
  public dropsService: DropsService;
  public events: EventsService;
  public kicks: KICKsService;
  public livestreams: LivestreamsService;
  public livestreamsV2: LivestreamsServiceV2;
  public moderation: ModerationService;
  public users: UsersService;

  constructor(options: KickClientOptions) {
    this.oauth = new OAuth(this, options.clientId, options.clientSecret, options.redirectUri);
    this.categories = new CategoriesService(this);
    this.categoriesV2 = new CategoriesServiceV2(this);
    this.channels = new ChannelsService(this);
    this.channelRewards = new ChannelRewardsService(this);
    this.chat = new ChatService(this);
    this.dropsService = new DropsService(this);
    this.events = new EventsService(this);
    this.kicks = new KICKsService(this);
    this.livestreams = new LivestreamsService(this);
    this.livestreamsV2 = new LivestreamsServiceV2(this);
    this.moderation = new ModerationService(this);
    this.users = new UsersService(this);
  }

  setToken(token: Token) {
    this.token = token;
  }

  setAppToken(appToken: AppToken) {
    this.appToken = appToken;
  }

  /**
   * Access token to use for requests.
   * @param tokenType Force 'user' or 'app'. Omit to prefer the user token, falling back to the app token.
   */
  authToken(tokenType?: 'user' | 'app'): string {
    if (tokenType === 'user') {
      if (!this.token) {
        throw new NoTokenSetError('No user token set on KickClient.');
      }
      return this.token.access_token;
    }
    if (tokenType === 'app') {
      return this.requireAppToken();
    }

    const token = this.token?.access_token ?? this.appToken?.access_token;
    if (!token) {
      throw new NoTokenSetError('No user or app token set on KickClient.');
    }
    return token;
  }

  /** Whether `authToken(tokenType)` would resolve to the user token: forced via `tokenType`, or the default fallback when a user token is set. */
  usingUserToken(tokenType?: 'user' | 'app'): boolean {
    return tokenType === 'user' || (!tokenType && !!this.token);
  }

  /** App token to use for endpoints that only accept app tokens (e.g. Drops), never a user token. */
  private requireAppToken(): string {
    if (!this.appToken) {
      throw new NoTokenSetError('No app token set on KickClient. This endpoint requires an app token.');
    }
    return this.appToken.access_token;
  }

  destroy() {
    for (const broadcasterUserId of this.registeredBroadcasterIds) {
      eventManager.destroy(broadcasterUserId, this.eventEmitter);
    }
    this.registeredBroadcasterIds.clear();
  }

  /**
   * Registers this client's emitter with the {@link EventManager} so that webhooks targeting
   * `broadcasterUserId` are dispatched to `client.on(...)` listeners. Called by
   * `EventsService.subscribe`/`subscribeMultiple` - works for both user and app access tokens,
   * since subscriptions are always tied to an explicit (or resolved) broadcaster user id.
   */
  registerEventTarget(broadcasterUserId: string) {
    if (this.registeredBroadcasterIds.has(broadcasterUserId)) return;
    eventManager.register(broadcasterUserId, this.eventEmitter);
    this.registeredBroadcasterIds.add(broadcasterUserId);
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

  requiresUserScope(scope: Scope) {
    if (!this.token) {
      throw new NoTokenSetError('No user token set on KickClient.');
    }
    const tokenScopes = this.token.scope ? this.token.scope.split(' ') : [];
    if (!tokenScopes.includes(scope)) {
      throw new MissingScopeError(`Missing required scope: ${scope}`);
    }
  }
}
