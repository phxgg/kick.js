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

export class RateLimitError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class NoTokenSetError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NoTokenSetError';
  }
}

export class UserTokenRequiredError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UserTokenRequiredError';
  }
}

export class AppTokenRequiredError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'AppTokenRequiredError';
  }
}

export class MissingScopeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MissingScopeError';
  }
}
