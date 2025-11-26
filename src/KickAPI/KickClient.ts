import { AppToken, OAuth, Token } from './OAuth';
import { CategoriesService } from './services/CategoriesService';
import { ChannelsService } from './services/ChannelsService';
import { ChatService } from './services/ChatService';
import { EventsService } from './services/EventsService';
import { KICKsService } from './services/KICKsService';
import { LivestreamsService } from './services/LivestreamsService';
import { ModerationService } from './services/ModerationService';
import { UsersService } from './services/UsersService';

export const KICK_BASE_URL: string = 'https://api.kick.com/public/v1';

export class KickClient {
  public token: Token | null = null;
  public appToken: AppToken | null = null;
  public oauth: OAuth;

  public categories: CategoriesService;
  public channels: ChannelsService;
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
    this.users = new UsersService(this);
    this.chat = new ChatService(this);
    this.moderation = new ModerationService(this);
    this.livestreams = new LivestreamsService(this);
    this.events = new EventsService(this);
    this.kicks = new KICKsService(this);
  }

  setToken(token: Token) {
    this.token = token;
  }
}
