import { BaseResponse } from '../BaseResponse';
import { Category, CategoryDto } from '../Category';
import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';

export type SearchCategoryParams = {
  q: string;
  page?: number;
};

export type SearchCategoryResponse = BaseResponse<CategoryDto[]>;
export type FetchCategoryResponse = BaseResponse<CategoryDto>;

export class CategoriesService {
  private readonly CATEGORIES_URL: string = KICK_BASE_URL + '/categories';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Get Categories based on the search word.
   * Returns up to 100 results at a time; use the page parameter to get more results.
   * @param options The search parameters
   * @param options.q Search query
   * @param options.page Page (defaults to 1 if not provided)
   */
  async search({ q, page }: SearchCategoryParams): Promise<Category[]> {
    const url = new URL(this.CATEGORIES_URL);
    url.searchParams.append('q', q);
    if (page) {
      url.searchParams.append('page', page.toString());
    }
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      handleError(response);
    }
    const json = (await response.json()) as SearchCategoryResponse;
    const categories = json.data.map((category) => new Category(this.client, category));
    return categories;
  }

  /**
   * Get information about a specific category.
   * @param id The ID of the category to fetch
   */
  async fetch(id: number): Promise<Category> {
    const response = await fetch(`${this.CATEGORIES_URL}/${String(id)}`, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      handleError(response);
    }
    const json = (await response.json()) as FetchCategoryResponse;
    const category = new Category(this.client, json.data);
    return category;
  }
}
