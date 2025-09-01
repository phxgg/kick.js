import { CategoriesService } from './services/CategoriesService';
import { OAuth, AppTokenResponse } from './OAuth';
import { UsersService } from './services/UsersService';
import { ChatService } from './services/ChatService';
import { ChannelsService } from './services/ChannelsService';

export const KICK_BASE_URL: string = 'https://api.kick.com/public/v1';

export class KickClient {
  public token: AppTokenResponse | null = null;
  public oauth: OAuth;

  public categories: CategoriesService;
  public channels: ChannelsService;
  public users: UsersService;
  public chat: ChatService;

  constructor(clientId: string, clientSecret: string) {
    this.oauth = new OAuth(clientId, clientSecret);
    this.categories = new CategoriesService(this);
    this.channels = new ChannelsService(this);
    this.users = new UsersService(this);
    this.chat = new ChatService(this);
  }

  async initialize() {
    this.token = await this.oauth.generateAppToken();
    console.log('[KickClient] Login successful');
  }
}
