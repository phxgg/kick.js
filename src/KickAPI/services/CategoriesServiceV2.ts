import { BaseResponse, BaseResponseWithPagination } from '../BaseResponse';
import { KickClient } from '../KickClient';
import { Category, CategoryDto } from '../resources/Category';
import { constructEndpoint, handleError, parseJSON } from '../utils';
import { Version } from '../Version';

export type SearchCategoryParamsV2 = {
  cursor?: string;
  limit?: number;
  name?: string[];
  tag?: string[];
  id?: number | number[];
};

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
   * @param options The search parameters
   * @param options.cursor (Optional) Cursor for pagination
   * @param options.limit (Optional) Number of results to return (max 100)
   * @param options.name (Optional) Array of category names to filter by
   * @param options.tag (Optional) Array of tags to filter by
   * @param options.id (Optional) Single ID or array of IDs to filter by
   * @returns An array of `Category` instances.
   */
  async search(params: SearchCategoryParamsV2): Promise<Omit<Category, 'viewerCount'>[]> {
    const endpoint = new URL(this.CATEGORIES_URL);

    // Append params
    if (params.cursor) {
      endpoint.searchParams.append('cursor', params.cursor);
    }
    if (params.limit) {
      endpoint.searchParams.append('limit', params.limit.toString());
    }
    if (params.name) {
      for (const name of params.name) {
        endpoint.searchParams.append('name', name);
      }
    }
    if (params.tag) {
      for (const tag of params.tag) {
        endpoint.searchParams.append('tag', tag);
      }
    }
    if (params.id) {
      if (Array.isArray(params.id)) {
        for (const id of params.id) {
          endpoint.searchParams.append('id', id.toString());
        }
      } else {
        endpoint.searchParams.append('id', params.id.toString());
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
