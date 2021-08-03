import { Document, Schema } from 'mongoose';
import { User } from 'src/users/user.model';
import { productStatus } from './product-status.enum';

export const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export interface Product extends Document {
  id: string;
  title: string;
  description: string;
  price: number;
  status: productStatus;
  owner: User;
}
