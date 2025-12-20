import { KickClient } from '../KickClient';
import { Serializable } from '../Serializable';

export type UserDto = {
  email: string;
  name: string;
  profile_picture: string;
  user_id: number;
};

export class User extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: UserDto
  ) {
    super();
    this.client = client;
  }

  get email(): string {
    return this.dto.email;
  }

  get name(): string {
    return this.dto.name;
  }

  get profilePicture(): URL {
    return new URL(this.dto.profile_picture);
  }

  get userId(): number {
    return this.dto.user_id;
  }
}
