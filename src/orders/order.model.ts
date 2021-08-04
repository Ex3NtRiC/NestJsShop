import { Document, Schema, Types } from 'mongoose';

export const OrdersSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
});

export interface Order extends Document {
  owner: Types.ObjectId;
  items: item[];
  total: number;
}

export interface item {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}
