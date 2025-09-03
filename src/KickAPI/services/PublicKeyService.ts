import { BaseResponse } from '../BaseResponse';
import { handleError } from '../errors';
import { KICK_BASE_URL } from '../KickClient';

export type PublicKeyDto = { public_key: string };
export type PublicKeyResponse = BaseResponse<PublicKeyDto>;

interface CacheEntry {
  key: string;
  fetchedAt: number;
}

export class PublicKeyService {
  private static instance: PublicKeyService;
  private cache: CacheEntry | null = null;
  private inFlight?: Promise<string>;
  // Optional TTL (ms). Set to Infinity if Kick public key never rotates.
  private readonly ttlMs: number;

  private constructor(ttlMs = 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  static getInstance(): PublicKeyService {
    if (!this.instance) {
      this.instance = new PublicKeyService();
    }
    return this.instance;
  }

  /**
   * Returns the (possibly cached) public key; refreshes when TTL expired.
   * Ensures only one network fetch runs concurrently.
   */
  async getPublicKey(): Promise<string> {
    const now = Date.now();
    if (this.cache && now - this.cache.fetchedAt < this.ttlMs) {
      return this.cache.key;
    }
    if (this.inFlight) {
      return this.inFlight;
    }
    this.inFlight = (async () => {
      const response = await fetch(KICK_BASE_URL + '/public-key');
      if (!response.ok) {
        handleError(response);
      }
      const json = (await response.json()) as PublicKeyResponse;
      const key = json.data.public_key;
      this.cache = { key, fetchedAt: Date.now() };
      this.inFlight = undefined;
      return key;
    })().catch((err) => {
      this.inFlight = undefined;
      throw err;
    });
    return this.inFlight;
  }

  // Force refresh (ignore cache)
  async refresh(): Promise<string> {
    this.cache = null;
    return this.getPublicKey();
  }
}

// Convenience exported function if callers prefer a simple API
export async function getKickPublicKey(): Promise<string> {
  return PublicKeyService.getInstance().getPublicKey();
}
