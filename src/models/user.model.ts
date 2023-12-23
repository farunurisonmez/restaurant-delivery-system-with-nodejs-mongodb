import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  age: number;
  gender: string;
  profileImage: string;
  addresses: {
    openAddress: string;
    city: string;
    district: string;
    type: string;
  }[];
}

const addressSchema = new Schema({
    openAddress: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    type: { type: String, required: true },
  });

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  profileImage: String,
  addresses: [addressSchema],
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
