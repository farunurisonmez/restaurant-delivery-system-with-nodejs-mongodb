import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMenu {
  name: String;
  price: Number;
  content: String;
  coverImage: String;
}

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IAddress {
  city: string;
  district: string;
  openAddress: string;
}

export interface IReview {
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    comment: string;
    rating: number;
}

export interface IRestaurant extends Document {
  name: string;
  description: string;
  logo: string;
  address: IAddress;
  location: ILocation;
  branches: string[];
  menu: IMenu[];
  types: string[];
  reviews: IReview[];
  totalRating: number;
  orderCount: number;
  averageRating: number;
}

const menuSchema = new Schema<IMenu>({
    name: String,
    price: Number,
    content: String,
    coverImage: String,
});

const addressSchema = new Schema<IAddress>({
    city: { type: String, minlength: 5, maxlength: 20, required: true, message: 'City is required.' },
    district: { type: String, minlength: 5, maxlength: 20, required: [true, 'District is required.'] },
    openAddress: { type: String, minlength: 5, maxlength: 100, required: [true, 'Open Address is required.'] },
});

const locationSchema = new Schema<ILocation>({
  latitude: { type: Number, required: [true, 'Latitude is required.'] },
  longitude: { type: Number, required: [true, 'Longitude is required.'] },
});

locationSchema.index({ coordinates: '2dsphere' });

const reviewSchema = new Schema<IReview>({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  });

const restaurantSchema = new Schema<IRestaurant>({
  name: { type: String, minlength: 5, maxlength: 50, required: [true, 'Name is required.'], unique: true },
  description: { type: String, minlength: 5, maxlength: 100 },
  logo: { type: String, minlength: 5, maxlength: 20, required: [true, 'Logo is required.'] },
  address: { type: addressSchema, required: true, message: 'Address is required.' },
  location: { type: locationSchema, required: true, message: 'Location is required.' },
  branches: [String],
  menu: { type: [menuSchema], required: [true, 'Menu is required.'], minItems: 1 },
  types: [String],
  reviews: { type: [reviewSchema], default: [] },
  totalRating: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
});

const Restaurant: Model<IRestaurant> = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;