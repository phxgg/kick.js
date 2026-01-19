import { BaseResponse } from './BaseResponse';
import { KickClient } from './KickClient';
import { Scope } from './Scope';
import { generateCodeChallenge, generateCodeVerifier, handleError, parseJSON } from './utils';

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

export type TokenIntrospect = {
  active: boolean;
  client_id: string;
  exp: number;
  scope: string;
  token_type: string;
};

export type TokenIntrospectResponse = BaseResponse<TokenIntrospect>;

export class OAuth {
  private readonly OAUTH_URL: string = 'https://id.kick.com';
  protected readonly client: KickClient;

  private clientId: string;
  private clientSecret: string;

  constructor(client: KickClient, clientId: string, clientSecret: string) {
    this.client = client;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Generate the URL where users can authorize your application.
   * @returns An object containing the authorization URL and the code verifier.
   */
  async generateAuthorizeURL(): Promise<{
    url: string;
    codeVerifier: string;
  }> {
    const authorizeUrl = new URL(`${this.OAUTH_URL}/oauth/authorize`);
    const scopes = Object.values(Scope);

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

  /**
   * Exchange an authorization code for an access token.
   * @param code The authorization code received from the authorization server.
   * @param codeVerifier The code verifier used to generate the code challenge.
   * @returns An object containing the access token and related information.
   */
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

  /**
   * Generate an application token using client credentials.
   * @returns An object containing the application token and related information.
   */
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

  /**
   * Refresh an access token using a refresh token.
   * @param refreshToken The refresh token.
   * @returns An object containing the new access token and related information.
   */
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

  /**
   * Revoke an access or refresh token.
   * @param token The token to revoke.
   * @param tokenHintType The type of token being revoked (access or refresh, defaults to access token).
   */
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

  /**
   * Get information about the token that is passed in via the Authorization header.
   * This function is implements part of the on the OAuth 2.0 spec for token introspection.
   * Find the full spec here: https://datatracker.ietf.org/doc/html/rfc7662
   * When `active=false` there is no additional information added in the response.
   *
   * @returns Token information.
   */
  async introspect(): Promise<TokenIntrospect> {
    const endpoint = new URL(`${this.OAUTH_URL}/oauth/token/introspect`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<TokenIntrospectResponse>(response);
    const token = json.data;
    return token;
  }
}
