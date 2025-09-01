import { KICK_BASE_URL, KickClient } from '../Client';

export type SearchCategoryDto = {
  q: string;
  page?: number;
};

export type SearchCategoryResponse = {
  data: {
    id: number;
    name: string;
    thumbnail: string;
  }[];
  message: string;
};

export type FetchCategoryResponse = {
  data: {
    id: number;
    name: string;
    thumbnail: string;
  };
  message: string;
};

export class CategoriesService {
  private CATEGORIES_URL: string = KICK_BASE_URL + '/categories';
  private client: KickClient;

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
  async search({ q, page }: SearchCategoryDto): Promise<SearchCategoryResponse> {
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
      throw new Error('Failed to search categories');
    }
    return response.json();
  }

  /**
   * Get information about a specific category.
   * @param id The ID of the category to fetch
   */
  async fetch(id: number | string): Promise<FetchCategoryResponse> {
    const response = await fetch(`${this.CATEGORIES_URL}/${String(id)}`, {
      headers: {
        Authorization: `Bearer ${this.client.token?.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }
    return response.json();
  }
}
