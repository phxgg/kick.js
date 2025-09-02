import { KickClient } from './Client';
import { Serializable } from './Serializable';

export type CategoryDto = {
  id: number;
  name: string;
  thumbnail: string;
};

export class Category extends Serializable {
  protected readonly client: KickClient;

  constructor(
    client: KickClient,
    private dto: CategoryDto
  ) {
    super();
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
