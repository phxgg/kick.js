import { BaseResponse } from '../BaseResponse';
import { KickClient } from '../KickClient';
import { Category, CategoryDto } from '../resources/Category';
import { constructEndpoint, handleError, parseJSON } from '../utils';
import { Version } from '../Version';

export type SearchCategoryParams = {
  q: string;
  page?: number;
};

export type SearchCategoryResponse = BaseResponse<Omit<CategoryDto, 'viewer_count'>[]>;
export type FetchCategoryResponse = BaseResponse<CategoryDto>;

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
   * @param options The search parameters
   * @param options.q Search query
   * @param options.page (Optional) Page (defaults to 1 if not provided)
   * @returns An array of `Category` instances.
   */
  async search({ q, page }: SearchCategoryParams): Promise<Omit<Category, 'viewerCount'>[]> {
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
