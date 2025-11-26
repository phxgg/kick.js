import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../KickClient';
import { User, type UserDto } from '../User';
import { handleError, parseJSON } from '../utils';

type TokenIntrospect = {
  active: boolean;
  client_id: string;
  exp: number;
  scope: string;
  token_type: string;
};

export type TokenIntrospectResponse = BaseResponse<TokenIntrospect>;
export type FetchUserResponse = BaseResponse<UserDto[]>;

export class UsersService {
  private readonly USERS_URL: string = KICK_BASE_URL + '/users';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get information about the token that is passed in via the Authorization header.
   * This function is implements part of the on the OAuth 2.0 spec for token introspection.
   * Find the full spec here: https://datatracker.ietf.org/doc/html/rfc7662
   * When `active=false` there is no additional information added in the response.
   */
  async introspect(): Promise<TokenIntrospect> {
    const endpoint = new URL(KICK_BASE_URL + '/token/introspect');

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

  /**
   * Retrieve user information based on provided user IDs.
   * If no user IDs are specified, the information
   * for the currently authorised user will be returned by default.
   *
   * @param ids (Optional) Array of user IDs
   * @returns An array of User instances.
   */
  async fetch(ids?: number[]): Promise<User[]> {
    const endpoint = new URL(this.USERS_URL);

    if (ids) {
      ids.forEach((id) => endpoint.searchParams.append('id', String(id)));
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchUserResponse>(response);
    const data = json.data.map((user) => new User(this.client, user));
    return data;
  }

  async me(): Promise<User> {
    return (await this.fetch())[0];
  }
}
