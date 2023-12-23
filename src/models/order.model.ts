import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAddress {
    city: string;
    district: string;
    openAddress: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  orderDate: Date;
  deliveryAddress: IAddress[];
  isDelivered: boolean;
  comment?: string;
  rating?: number;
}

const deliveryAddressSchema = new Schema<IAddress>({
    city: { type: String, minlength: 5, maxlength: 20, required: true, message: 'City is required.' },
    district: { type: String, minlength: 5, maxlength: 20, required: [true, 'District is required.'] },
    openAddress: { type: String, minlength: 5, maxlength: 100, required: [true, 'Open Address is required.'] },
})

const orderSchema = new Schema<IOrder>({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryAddress: { type: [deliveryAddressSchema], required: true, message: 'Address is required.' },
    isDelivered: { type: Boolean, default: false },
    comment: {
        type: String,
        validate: {
            validator: async function(this: IOrder, comment: string): Promise<boolean> {
                // This user has not commented for this restaurant before
                const existingOrder = await Order.findOne({
                    userId: this.userId,
                    restaurantId: this.restaurantId,
                    comment: { $exists: true },
                });
                return !existingOrder;
            },
            message: 'This user has already commented for this restaurant.',
        },
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        validate: {
            validator: async function(this: IOrder, rating: number): Promise<boolean> {
                // This user has not rated for this restaurant before
                const existingOrder = await Order.findOne({
                    userId: this.userId,
                    restaurantId: this.restaurantId,
                    rating: { $exists: true },
                });
                return !existingOrder;
            },
            message: 'This user has already rated for this restaurant.',
        },
    },
});

// userId and restaurantId associated unique index
orderSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
