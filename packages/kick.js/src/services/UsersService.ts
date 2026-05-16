import { BaseResponse } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { User, type UserDto } from '../resources/User.js';
import { Scope } from '../Scope.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export type FetchUserResponse = BaseResponse<UserDto[]>;

export class UsersService {
  private readonly USERS_URL = constructEndpoint(Version.V1, 'users');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
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
