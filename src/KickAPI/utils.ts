import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from './errors';

export function handleError(response: Response) {
  switch (response.status) {
    case 400:
      throw new BadRequestError();
    case 401:
      throw new UnauthorizedError();
    case 403:
      throw new ForbiddenError();
    case 404:
      throw new NotFoundError();
    case 500:
      throw new InternalServerError();
  }
}

export async function parseJSON<T>(response: Response): Promise<T> {
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error('Failed to parse response body as JSON.');
  }
}
