import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProductsModule } from 'src/products/products.module';
@Module({
  imports: [
    ProductsModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
