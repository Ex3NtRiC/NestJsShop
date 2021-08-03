import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FetchProductsFilter } from './fetch-products.dto';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async fetchProducts(params: FetchProductsFilter): Promise<Product[]> {
    const { search, status, maxPrice, minPrice } = params;
    const query = this.productModel.find();
    if (status) {
      query.where({ status });
    }
    if (search) {
      query.where({
        $or: [{ title: /search/ }, { description: /search/ }],
      });
    }

    if (maxPrice) {
      query.where({ price: { $gte: +maxPrice } });
    }

    if (minPrice) {
      query.where({ price: { $lte: +minPrice } });
    }

    return await query.exec();
  }
}
