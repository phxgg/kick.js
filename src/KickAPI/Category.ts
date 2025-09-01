import { KickClient } from './Client';

export type CategoryDto = {
  id: number;
  name: string;
  thumbnail: string;
};

export class Category {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: CategoryDto,
  ) {
    this.client = client;
  }

  get id() {
    return this.dto.id;
  }

  get name() {
    return this.dto.name;
  }

  get thumbnail() {
    return this.dto.thumbnail;
  }
}
