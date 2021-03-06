import { Controller, Get, Logger, UseGuards, Query } from '@nestjs/common';
import { IsAuthenticated } from 'src/auth/isAuth.guard';
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
}
