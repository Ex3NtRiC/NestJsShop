import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { cart, User } from 'src/users/user.model';
import { item, Order } from './order.model';

@Injectable()
export class OrdersService {
  logger = new Logger('Orders Service');
  constructor(
    @InjectModel('Order') private readonly ordersModel: Model<Order>,
  ) {}

  async fetchOrders(user: User): Promise<Order[] | string> {
    try {
      const orders = await this.ordersModel.find({ owner: user.id });
      if (!orders) {
        return 'You have no orders';
      }
      return orders;
    } catch (err) {
      throw new InternalServerErrorException(
        'Error Occured, plase try again later!',
      );
    }
  }

  async addOrder(cart: cart, user: User): Promise<void> {
    try {
      const items: item[] = [];
      cart.items.forEach((item) =>
        items.push({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }),
      );
      const order: Order = new this.ordersModel({
        owner: user.id,
        items,
        total: cart.total,
      });
      this.logger.log('Saving Order');
      await order.save();
    } catch (err) {
      this.logger.log('Saving Order failed');
      throw new InternalServerErrorException(
        'Error occured, pelase try again later!',
      );
    }
  }
}
