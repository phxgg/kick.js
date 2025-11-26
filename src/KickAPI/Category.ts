import { KickClient } from './KickClient';
import { Serializable } from './Serializable';

export type CategoryDto = {
  id: number;
  name: string;
  tags: string[];
  thumbnail: string;
  viewer_count: number;
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

  get tags() {
    return this.dto.tags;
  }

  get thumbnail() {
    return this.dto.thumbnail;
  }

  get viewerCount() {
    return this.dto.viewer_count;
  }
}
