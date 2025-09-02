import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';

import { handleError } from './errors';

export type AppToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type Token = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

export enum TokenHintType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export class OAuth {
  private OAUTH_URL: string = 'https://id.kick.com';

  private clientId: string;
  private clientSecret: string;
  private codeVerifier: string;

  constructor(clientId: string, clientSecret: string, codeVerifier?: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.codeVerifier = codeVerifier || generateCodeVerifier();
  }

  async generateAuthorizeURL(): Promise<string> {
    const authorizeUrl = new URL(`${this.OAUTH_URL}/oauth/authorize`);
    const scopes = ['user:read', 'channel:read', 'channel:write', 'chat:write', 'events:subscribe', 'moderation:ban'];

    // Generate a code challenge from the verifier (async)
    const codeChallenge = generateCodeChallenge(this.codeVerifier);

    authorizeUrl.searchParams.append('client_id', this.clientId);
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append('redirect_uri', process.env.KICK_CALLBACK_URL);
    authorizeUrl.searchParams.append('state', 'your_state');
    authorizeUrl.searchParams.append('scope', scopes.join(' '));
    authorizeUrl.searchParams.append('code_challenge', codeChallenge);
    authorizeUrl.searchParams.append('code_challenge_method', 'S256');
    return authorizeUrl.toString();
  }

  async exchangeToken(code: string): Promise<Token> {
    const tokenUrl = `${this.OAUTH_URL}/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.KICK_CALLBACK_URL,
        code_verifier: this.codeVerifier,
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const data = (await response.json()) as Token;
    return data;
  }

  async generateAppToken(): Promise<AppToken> {
    const tokenUrl = `${this.OAUTH_URL}/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const data = await response.json();
    return data;
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    const tokenUrl = `${this.OAUTH_URL}/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      handleError(response);
    }

    const data = await response.json();
    return data;
  }

  async revokeToken(token: string, tokenHintType: TokenHintType = TokenHintType.ACCESS_TOKEN): Promise<void> {
    const tokenUrl = `${this.OAUTH_URL}/oauth/revoke`;
    const response = await fetch(`${tokenUrl}?token=${token}&token_hint_type=${tokenHintType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      handleError(response);
    }
  }
}
