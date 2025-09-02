import { Document, Model, model, models, Schema } from 'mongoose';

export interface IUser extends Document {
  kickUserId: string;
  name?: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    kickUserId: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
  },
  { timestamps: true }
);

// Reuse existing compiled model if present
export const UserModel: Model<IUser> = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);
