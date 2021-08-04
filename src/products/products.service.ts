import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/user.model';
import { AddProductDto } from './add-product.dto';
import { EditProductDto } from './edit-product.dto';
import { FetchProductsFilter } from './fetch-products.dto';
import { productStatus } from './product-status.enum';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  logger = new Logger('Products Service');
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
    this.logger.log(`fetching products`);
    return await query.exec();
  }

  async fetchUserProducts(
    params: FetchProductsFilter,
    user: User,
  ): Promise<Product[]> {
    const { search, status, maxPrice, minPrice } = params;
    console.log(search, status, maxPrice, minPrice);
    const query = this.productModel.find({ owner: user.id });
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

    this.logger.log(`fetching user products`);
    return await query.exec();
  }

  async findOne(id: string): Promise<Product> {
    try {
      this.logger.log(`Finding product with id: ${id}`);
      return await this.productModel.findById(id);
    } catch (err) {
      if (err.message.indexOf('Cast to ObjectId failed') !== -1) {
        throw new NotFoundException('No such product found');
      }
      throw new InternalServerErrorException(
        'Error Occured, please try again later',
      );
    }
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
      this.logger.log(`adding new product: ${title}`);
      await product.save();
    } catch (err) {
      throw new InternalServerErrorException(
        'Error occured, please try again later',
      );
    }
  }

  async editProduct(
    editProductDto: EditProductDto,
    id: string,
    user: User,
  ): Promise<void> {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(id),
      owner: user.id,
    });
    if (!product) {
      throw new NotFoundException('no such product');
    }
    const { title, description, price, status } = editProductDto;
    console.log(title, description, price, status);

    if (title) {
      product.title = title;
    }
    if (description) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (status) {
      product.status = status;
    }
    this.logger.log(`editing new product: ${title}`);
    await product.save();
  }

  async deleteProduct(id: string, user: User): Promise<void> {
    this.logger.log(`deleting product with id: ${id}`);
    const res = await this.productModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      owner: user.id,
    });
    if (!res) {
      throw new NotFoundException('No such Product');
    }
  }
}
