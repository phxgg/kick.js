import z from 'zod';

import { BaseResponse, BaseResponseWithPagination } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { Category, CategoryDto } from '../resources/Category.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export const searchCategoryParamsV2Schema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  name: z.array(z.string()).optional(),
  tag: z.array(z.string()).optional(),
  id: z.union([z.number(), z.array(z.number())]).optional(),
});
export type SearchCategoryParamsV2 = z.infer<typeof searchCategoryParamsV2Schema>;

export type SearchCategoryResponseV2 = BaseResponseWithPagination<Omit<CategoryDto, 'viewer_count'>[]>;
export type FetchCategoryResponseV2 = BaseResponse<CategoryDto>;

export class CategoriesServiceV2 {
  private readonly CATEGORIES_URL = constructEndpoint(Version.V2, 'categories');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get Categories based on the cursor, limit, names, and tags; or ids.
   *
   * @param params The search parameters
   * @param params.cursor (Optional) Cursor for pagination
   * @param params.limit (Optional) Number of results to return (max 100)
   * @param params.name (Optional) Array of category names to filter by
   * @param params.tag (Optional) Array of tags to filter by
   * @param params.id (Optional) Single ID or array of IDs to filter by
   * @returns An array of `Category` instances.
   */
  async search(params: SearchCategoryParamsV2): Promise<Omit<Category, 'viewerCount'>[]> {
    const schema = searchCategoryParamsV2Schema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid search parameters: ${schema.error.message}`);
    }
    const { cursor, limit, name, tag, id } = schema.data;
    const endpoint = new URL(this.CATEGORIES_URL);

    // Append params
    if (cursor) {
      endpoint.searchParams.append('cursor', cursor);
    }
    if (limit) {
      endpoint.searchParams.append('limit', limit.toString());
    }
    if (name) {
      for (const n of name) {
        endpoint.searchParams.append('name', n);
      }
    }
    if (tag) {
      for (const t of tag) {
        endpoint.searchParams.append('tag', t);
      }
    }
    if (id) {
      if (Array.isArray(id)) {
        for (const i of id) {
          endpoint.searchParams.append('id', i.toString());
        }
      } else {
        endpoint.searchParams.append('id', id.toString());
      }
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<SearchCategoryResponseV2>(response);
    const categories = json.data.map((category) => new Category(this.client, category));
    return categories as Omit<Category, 'viewerCount'>[];
  }

  /**
   * Get information about a specific category.
   *
   * @param id The ID of the category to fetch
   * @returns A `Category` instance.
   */
  async fetch(id: number) {
    const result = await this.search({ id, limit: 1 });
    if (result.length === 0) {
      throw new Error(`Category with ID ${id} not found.`);
    }
    return result[0] as Omit<Category, 'viewerCount'>;
  }
}
