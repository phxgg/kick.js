import { KickClient } from './Client';

export type CategoryDto = {
  id: number;
  name: string;
  thumbnail: string;
};

export class Category {
  client: KickClient;

  id: number;
  name: string;
  thumbnail: string;

  constructor(client: KickClient, { id, name, thumbnail }: CategoryDto) {
    this.client = client;
    this.id = id;
    this.name = name;
    this.thumbnail = thumbnail;
  }
}
