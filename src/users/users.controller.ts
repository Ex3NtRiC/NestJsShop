import {
  Query,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Body,
  NotFoundException,
  Delete,
  Patch,
  Logger,
  Put,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { IsAuthenticated } from 'src/auth/isAuth.guard';
import { AddProductDto } from 'src/products/add-product.dto';
import { EditProductDto } from 'src/products/edit-product.dto';
import { FetchProductsFilter } from 'src/products/fetch-products.dto';
import { User } from './user.model';
import { UsersService } from './users.service';

@UseGuards(IsAuthenticated)
@Controller(':name')
export class UsersController {
  logger = new Logger('User Controller');
  constructor(private readonly usersService: UsersService) {}

  @Get('products')
  fetchProducts(
    @Query() fetchProductsFilter: FetchProductsFilter,
    @GetUser() user: User,
    @Param('name') name: string,
  ) {
    if (name === user.name) {
      return this.usersService.fetchUserProducts(fetchProductsFilter, user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Post('add-product')
  addProduct(
    @Body() addProductDto: AddProductDto,
    @GetUser() user: User,
    @Param('name') name: string,
  ) {
    if (name === user.name) {
      this.logger.log('Adding a product');
      return this.usersService.addProduct(addProductDto, user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Patch('edit-product/:id')
  editProduct(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('name') name: string,
    @Body() editProductDto: EditProductDto,
  ) {
    if (name === user.name) {
      this.logger.log('Patching a product');
      return this.usersService.editProduct(editProductDto, id, user);
    }
    this.logger.log('Patching a product failed');
    throw new NotFoundException('Page Not Found');
  }

  @Delete('delete-product/:id')
  deleteProduct(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('name') name: string,
  ) {
    if (name === user.name) {
      return this.usersService.deleteProduct(id, user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Get('cart')
  getCart(@GetUser() user: User, @Param('name') name: string) {
    if (name === user.name) {
      return this.usersService.getCart(user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Put('add-to-cart/:id')
  addToCart(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('name') name: string,
    @Body('quantity') quantity: number,
  ) {
    if (name === user.name) {
      return this.usersService.addToCart(id, quantity, user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Delete('remove-from-cart/:id')
  removeFromcart(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('name') name: string,
  ) {
    if (name === user.name) {
      return this.usersService.removeFromCart(id, user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Get('orders')
  getOrders(@GetUser() user: User, @Param('name') name: string) {
    if (name === user.name) {
      return this.usersService.fetchOrders(user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Post('add-order')
  addOrder(@GetUser() user: User, @Param('name') name: string) {
    if (name === user.name) {
      return this.usersService.orderProducts(user);
    }
    throw new NotFoundException('Page Not Found');
  }

  @Get('test/:id')
  test(@Param('id') id: string) {
    this.usersService.test(id);
  }
}
