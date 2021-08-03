import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.model';
import { AddProductDto } from './add-product.dto';
import { FetchProductsFilter } from './fetch-products.dto';
import { productStatus } from './product-status.enum';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async fetchProducts(params: FetchProductsFilter): Promise<Product[]> {
    const { search, status, maxPrice, minPrice } = params;
    console.log(search, status, maxPrice, minPrice);
    const query = this.productModel.find();
    if (status) {
      query.where({ status });
    }
    if (search) {
      query.where({
        $or: [
          { title: { $regex: '.*' + search + '.*' } },
          { description: { $regex: '.*' + search + '.*' } },
        ],
      });
    }

    if (maxPrice) {
      query.where({ price: { $lte: +maxPrice } });
    }

    if (minPrice) {
      query.where({ price: { $gte: +minPrice } });
    }

    return await query.exec();
  }

  async addProduct(addProductDto: AddProductDto, user: User): Promise<void> {
    const { title, description, price } = addProductDto;
    console.log('sevice,user:', user);
    const product = new this.productModel({
      title,
      description,
      price,
      owner: user.id,
      status: productStatus.PRODUCT_AVAILABLE,
    });
    try {
      await product.save();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Error occured, please try again later',
      );
    }
  }
}
