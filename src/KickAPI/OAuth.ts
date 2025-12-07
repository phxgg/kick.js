import { Scopes } from './KickClient';
import { generateCodeChallenge, generateCodeVerifier, handleError } from './utils';

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
  private static instance: OAuth;
  private OAUTH_URL: string = 'https://id.kick.com';

  private clientId: string;
  private clientSecret: string;

  private constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get the singleton instance of the OAuth class
   * @param [clientId] The client ID (can be omitted if instance already exists)
   * @param [clientSecret] The client secret (can be omitted if instance already exists)
   * @returns The OAuth instance
   */
  static getInstance(clientId?: string, clientSecret?: string): OAuth {
    if (!this.instance) {
      if (!clientId || !clientSecret) {
        throw new Error('OAuth not initialized. Provide clientId and clientSecret.');
      }
      this.instance = new OAuth(clientId, clientSecret);
    }
    return this.instance;
  }

  async generateAuthorizeURL(): Promise<{
    url: string;
    codeVerifier: string;
  }> {
    const authorizeUrl = new URL(`${this.OAUTH_URL}/oauth/authorize`);
    const scopes = Object.values(Scopes);

    // Generate a code challenge from the verifier (async)
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    authorizeUrl.searchParams.append('client_id', this.clientId);
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append('redirect_uri', process.env.KICK_CALLBACK_URL);
    authorizeUrl.searchParams.append('state', 'your_state');
    authorizeUrl.searchParams.append('scope', scopes.join(' '));
    authorizeUrl.searchParams.append('code_challenge', codeChallenge);
    authorizeUrl.searchParams.append('code_challenge_method', 'S256');
    return { url: authorizeUrl.toString(), codeVerifier };
  }

  async exchangeToken(code: string, codeVerifier: string): Promise<Token> {
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
        code_verifier: codeVerifier,
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
