import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersSchema } from './order.model';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrdersSchema }]),
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
