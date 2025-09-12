import { Document, Model, model, models, Schema, type Types } from 'mongoose';

export enum TokenType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export interface IToken extends Document {
  jti: string; // JWT ID
  type: TokenType;
  provider: string; // e.g. 'kick', 'github'
  user?: Types.ObjectId; // Reference to User, optional for provider-level tokens
  revokedAt?: Date | null; // null if active, timestamp if revoked
  reason?: string; // Reason for revocation
  expiresAt: Date; // When the token expires
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: TokenType, required: true, index: true },
    provider: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    revokedAt: { type: Date, default: null, index: true },
    reason: { type: String },
    // Ensure automatic cleanup after token expiration
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL index: MongoDB will automatically delete documents after expiresAt
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Reuse existing compiled model if present
export const TokenModel: Model<IToken> = (models.Token as Model<IToken>) || model<IToken>('Token', TokenSchema);
