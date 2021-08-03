import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { IsAuthenticated } from 'src/auth/isAuth.guard';
import { User } from 'src/users/user.model';
import { AddProductDto } from './add-product.dto';
import { FetchProductsFilter } from './fetch-products.dto';
import { Product } from './product.model';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  logger = new Logger('Products Controller');
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(IsAuthenticated)
  @Get()
  fetchProducts(@Query() query: FetchProductsFilter): Promise<Product[]> {
    console.log(query);
    this.logger.log(`Fetching products ${query}`);
    return this.productsService.fetchProducts(query);
  }

  @UseGuards(IsAuthenticated)
  @Post('add-product')
  addProduct(@Body() addProductDto: AddProductDto, @GetUser() user: User) {
    console.log(user);
    return this.productsService.addProduct(addProductDto, user);
  }
}
