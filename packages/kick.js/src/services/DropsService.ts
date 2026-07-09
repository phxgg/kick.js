import z from 'zod';

import { BaseResponse } from '../BaseResponse.js';
import { AppTokenRequiredError } from '../Errors.js';
import type { KickClient } from '../KickClient.js';
import { RequestOptions } from '../RequestOptions.js';
import { DropClaim, DropClaimDto } from '../resources/DropClaim.js';
import { constructEndpoint, handleError, parseJSON } from '../utils.js';
import { Version } from '../Version.js';

export const retrieveClaimsParamsSchema = z.object({
  campaign_id: z.string().optional(),
  limit: z.number().max(1000).default(10).optional(),
  cursor: z.string().optional(),
  user_id: z.number().optional(),
  claim_id: z.string().optional(),
  external_status: z.string().optional(),
});
export type RetrieveClaimsParams = z.infer<typeof retrieveClaimsParamsSchema>;

export const updateClaimParamsSchema = z.object({
  claims: z
    .array(
      z.object({
        claim_id: z.string(),
        external_status: z.string(),
      })
    )
    .max(100),
});
export type UpdateClaimParams = z.infer<typeof updateClaimParamsSchema>;

export type RetrieveClaimsResponse = BaseResponse<{
  claims: DropClaimDto[];
  cursor: string | null;
}>;

export type UpdateClaimsResponse = BaseResponse<{
  claims: Pick<DropClaimDto, 'claim_id' | 'external_status'>[];
}>;

/**
 * Authorization: Requires app access tokens from OAuth apps associated with the organization.
 * @see https://docs.kick.com/drops/drops-guide
 */
export class DropsService {
  private readonly DROPS_URL = constructEndpoint(Version.V1, 'drops/claims');
  protected readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Retrieve claims based on the provided parameters.
   * This method allows filtering by campaign ID, user ID, claim ID, external status, and supports pagination through limit and cursor.
   * @param params The parameters for retrieving claims.
   * @param options (Optional) Request options.
   * @returns An array of `DropClaim` instances.
   */
  async retrieve(params: RetrieveClaimsParams, options?: RequestOptions): Promise<DropClaim[]> {
    if (options?.tokenType === 'user') {
      throw new AppTokenRequiredError('Retrieving claims requires an app access token.');
    }

    const schema = retrieveClaimsParamsSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid retrieve claims parameters: ${schema.error.message}`);
    }

    const { campaign_id, limit, cursor, user_id, claim_id, external_status } = schema.data;
    const endpoint = new URL(this.DROPS_URL);

    if (campaign_id) {
      endpoint.searchParams.append('campaign_id', campaign_id);
    }
    if (limit) {
      endpoint.searchParams.append('limit', limit.toString());
    }
    if (cursor) {
      endpoint.searchParams.append('cursor', cursor);
    }
    if (user_id) {
      endpoint.searchParams.append('user_id', user_id.toString());
    }
    if (claim_id) {
      endpoint.searchParams.append('claim_id', claim_id);
    }
    if (external_status) {
      endpoint.searchParams.append('external_status', external_status);
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${this.client.authToken('app')}`,
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<RetrieveClaimsResponse>(response);
    const claims = json.data.claims.map((claim) => new DropClaim(this.client, claim));
    return claims;
  }

  /**
   * Retrieve a single claim by its claim_id.
   *
   * @param claimId The ID of the claim to retrieve.
   * @param options (Optional) Request options.
   * @returns A `DropClaim` instance.
   * @remarks This method is a convenience wrapper around the `retrieve` method.
   */
  async fetch(claimId: string, options?: RequestOptions): Promise<DropClaim> {
    const claims = await this.retrieve({ claim_id: claimId, limit: 1 }, options);
    if (claims.length === 0) {
      throw new Error(`No claim found with claim_id: ${claimId}`);
    }
    return claims[0];
  }

  /**
   * Update the external status of one or more claims.
   *
   * @param params The parameters for updating claims, including an array of claim updates.
   * @param options (Optional) Request options.
   * @returns An array of objects containing the claim_id and the updated external_status for each claim.
   * @throws An error if the request fails or if the parameters are invalid.
   */
  async update(
    params: UpdateClaimParams,
    options?: RequestOptions
  ): Promise<Pick<DropClaimDto, 'claim_id' | 'external_status'>[]> {
    if (options?.tokenType === 'user') {
      throw new AppTokenRequiredError('Updating claims requires an app access token.');
    }

    const schema = updateClaimParamsSchema.safeParse(params);

    if (!schema.success) {
      throw new Error(`Invalid update claim parameters: ${schema.error.message}`);
    }

    const endpoint = new URL(this.DROPS_URL);

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.client.authToken('app')}`,
      },
      body: JSON.stringify(schema.data),
    });

    if (!response.ok) {
      handleError(response);
    }

    const json = await parseJSON<UpdateClaimsResponse>(response);
    return json.data.claims;
  }

  /**
   * Update a single claim's external status.
   *
   * @param claimId The ID of the claim to update.
   * @param externalStatus The new external status to set for the claim.
   * @param options (Optional) Request options.
   * @returns An object containing the claim_id and the updated external_status.
   * @throws An error if the claim cannot be found or updated.
   * @remarks This method is a convenience wrapper around the `update` method for updating a single claim.
   */
  async updateOne(
    claimId: string,
    externalStatus: string,
    options?: RequestOptions
  ): Promise<Pick<DropClaimDto, 'claim_id' | 'external_status'>> {
    const updatedClaims = await this.update(
      { claims: [{ claim_id: claimId, external_status: externalStatus }] },
      options
    );
    return updatedClaims[0];
  }

  /**
   * Update a single claim's external status and then fetch the updated claim.
   *
   * @param claimId The ID of the claim to update and fetch.
   * @param externalStatus The new external status to set for the claim.
   * @param options (Optional) Request options
   * @returns A `DropClaim` instance representing the updated claim.
   * @throws An error if the claim cannot be found or updated.
   * @remarks This method first updates the claim's external status and then retrieves the updated claim from the API.
   * It is a convenience method that combines the functionality of `updateOne` and `fetch`.
   */
  async updateOneAndFetch(claimId: string, externalStatus: string, options?: RequestOptions): Promise<DropClaim> {
    const updatedClaim = await this.updateOne(claimId, externalStatus, options);
    return this.fetch(updatedClaim.claim_id, options);
  }
}
