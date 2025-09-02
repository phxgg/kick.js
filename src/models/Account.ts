import { Schema, model, Document, Types } from 'mongoose';

export interface IAccount extends Document {
  userId: Types.ObjectId;
  provider: string; // e.g. 'github', 'auth0', 'spotify'
  providerAccountId: string; // subject/user id from provider
  accessToken?: string | null; // (optional) store if you need to call provider APIs
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string[] | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    tokenType: { type: String, default: null },
    scope: { type: [String], default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const AccountModel = model<IAccount>('Account', AccountSchema);
