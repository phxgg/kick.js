import { KICK_BASE_URL, KickClient } from '../Client';

export type TokenIntrospectResponse = {
  data: {
    active: boolean;
    client_id: string;
    exp: number;
    scope: string;
    token_type: string;
  };
  message: string;
};

export type FetchUserResponse = {
  data: {
    email: string;
    name: string;
    profile_picture: string;
    user_id: number;
  }[];
  message: string;
};

export class UsersService {
  private USERS_URL: string = KICK_BASE_URL + '/users';
  private client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get information about the token that is passed in via the Authorization header.
   * This function is implements part of the on the OAuth 2.0 spec for token introspection.
   * Find the full spec here: https://datatracker.ietf.org/doc/html/rfc7662
   * When active=false there is no additional information added in the response.
   */
  async introspect(): Promise<TokenIntrospectResponse> {
    const response = await fetch(`${KICK_BASE_URL}/token/introspect`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to introspect token');
    }
    return response.json();
  }

  /**
   * Retrieve user information based on provided user IDs.
   * If no user IDs are specified, the information
   * for the currently authorised user will be returned by default.
   * @param id The ID of the user to fetch
   */
  async fetch(id?: number | string): Promise<FetchUserResponse> {
    const url = id ? `${this.USERS_URL}/${String(id)}` : this.USERS_URL;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }
}
