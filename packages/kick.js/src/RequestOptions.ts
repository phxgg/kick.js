/** Per-call overrides for methods that support both user and app access tokens. */
export interface RequestOptions {
  /** Force this call to use the user or app token instead of the default (prefer user, fall back to app). */
  tokenType?: 'user' | 'app';
}
