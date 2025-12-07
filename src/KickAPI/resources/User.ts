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

  get email() {
    return this.dto.email;
  }

  get name() {
    return this.dto.name;
  }

  get profilePicture() {
    return this.dto.profile_picture;
  }

  get userId() {
    return this.dto.user_id;
  }
}
