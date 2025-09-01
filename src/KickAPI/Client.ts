import { CategoriesService } from './services/CategoriesService';
import { OAuth, AppToken, Token } from './OAuth';
import { UsersService } from './services/UsersService';
import { ChatService } from './services/ChatService';
import { ChannelsService } from './services/ChannelsService';
import { ModerationService } from './services/ModerationService';
import { LivestreamsService } from './services/LivestreamsService';

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

  constructor(clientId: string, clientSecret: string) {
    this.oauth = new OAuth(clientId, clientSecret);
    this.categories = new CategoriesService(this);
    this.channels = new ChannelsService(this);
    this.users = new UsersService(this);
    this.chat = new ChatService(this);
    this.moderation = new ModerationService(this);
    this.livestreams = new LivestreamsService(this);
  }

  async initializeAppToken() {
    this.appToken = await this.oauth.generateAppToken();
    console.log('[KickClient] App token initialized');
  }

  setToken(token: Token) {
    this.token = token;
  }
}
