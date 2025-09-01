import { BaseResponse } from '../BaseResponse';
import { KICK_BASE_URL, KickClient } from '../Client';
import { handleError } from '../errors';

export type PublicKey = {
  publicKey: string;
};

export type PublicKeyResponse = BaseResponse<PublicKey>;

export class PublicKeyService {
  private readonly PUBLIC_KEY_URL: string = KICK_BASE_URL + '/public-key';
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  async getPublicKey(): Promise<string> {
    const response = await fetch(this.PUBLIC_KEY_URL);
    if (!response.ok) {
      handleError(response);
    }
    const json = (await response.json()) as PublicKeyResponse;
    const publicKey = json.data.publicKey;
    return publicKey;
  }
}
