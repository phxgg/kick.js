import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import type { KickClient } from '../KickClient.js';
import { Category, CategoryDto } from '../resources/Category.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export const searchCategoryParamsSchema = z.object({
  q: z.string(),
  page: z.number().optional(),
});
export type SearchCategoryParams = z.infer<typeof searchCategoryParamsSchema>;

export type SearchCategoryResponse = BaseResponse<Omit<CategoryDto, 'viewer_count'>[]>;
export type FetchCategoryResponse = BaseResponse<CategoryDto>;

/**
 * @deprecated Use `CategoriesServiceV2` instead.
 */
export class CategoriesService {
  private readonly CATEGORIES_URL = constructEndpoint(Version.V1, 'categories');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get Categories based on the search word.
   * Returns up to 100 results at a time; use the page parameter to get more results.
   *
   * @param params The search parameters
   * @param params.q Search query
   * @param params.page (Optional) Page (defaults to 1 if not provided)
   * @returns An array of `Category` instances.
   * @deprecated Use `CategoriesServiceV2` instead.
   */
  async search(params: SearchCategoryParams): Promise<Omit<Category, 'viewerCount'>[]> {
    const schema = searchCategoryParamsSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid search parameters: ${schema.error.message}`);
    }

    const { q, page } = schema.data;
    const endpoint = new URL(this.CATEGORIES_URL);

    endpoint.searchParams.append('q', q);
    if (page) {
      endpoint.searchParams.append('page', page.toString());
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<SearchCategoryResponse>(response);
    const categories = json.data.map((category) => new Category(this.client, category));
    return categories as Omit<Category, 'viewerCount'>[];
  }

  /**
   * Get information about a specific category.
   *
   * @param id The ID of the category to fetch
   * @returns A `Category` instance.
   * @deprecated Use `CategoriesServiceV2` instead.
   */
  async fetch(id: number): Promise<Category> {
    const endpoint = new URL(`${this.CATEGORIES_URL}/${id}`);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<FetchCategoryResponse>(response);
    const category = new Category(this.client, json.data);
    return category;
  }
}
