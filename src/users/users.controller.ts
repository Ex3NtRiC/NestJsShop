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
}
