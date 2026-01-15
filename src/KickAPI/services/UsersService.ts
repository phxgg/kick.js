import { BaseResponse } from '../BaseResponse';
import { KickClient } from '../KickClient';
import { User, type UserDto } from '../resources/User';
import { Scope } from '../Scope';
import { constructEndpoint, handleError, parseJSON } from '../utils';
import { Version } from '../Version';

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
  private readonly USERS_URL = constructEndpoint(Version.V1, 'users');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
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
    const TOKEN_INTROSPECT_ENDPOINT = constructEndpoint(Version.V1, 'token/introspect');
    const endpoint = new URL(TOKEN_INTROSPECT_ENDPOINT);

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
   * Required scopes:
   * `user:read`
   *
   * @param ids (Optional) Array of user IDs
   * @returns An array of `User` instances.
   */
  async fetch(ids?: number[]): Promise<User[]> {
    this.client.requiresScope(Scope.USER_READ);

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
