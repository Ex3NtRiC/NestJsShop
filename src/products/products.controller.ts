import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
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
  fetchProducts(@Param() params: FetchProductsFilter): Promise<Product[]> {
    this.logger.log(`Fetching products ${params}`);
    return this.productsService.fetchProducts(params);
  }
}
