import { KickClient } from './Client';

export type UserDto = {
  email: string;
  name: string;
  profile_picture: string;
  user_id: number;
};

export class User {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: UserDto,
  ) {
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

  toJSON() {
    return {
      email: this.email,
      name: this.name,
      profile_picture: this.profilePicture,
      user_id: this.userId,
    };
  }
}
