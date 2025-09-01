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

export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InternalServerError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}
