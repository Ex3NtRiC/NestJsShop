import { Document, Schema, Types } from 'mongoose';

export const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
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
      default: 0,
      required: true,
    },
  },
});

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  cart: cart;
}

export interface cart {
  items: items[];
  total: number;
}

interface items {
  product: Types.ObjectId;
  price: number;
  quantity: number;
}
