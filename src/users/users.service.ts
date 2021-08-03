import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import { hash } from 'bcrypt';
import { ProductsService } from 'src/products/products.service';
import { FetchProductsFilter } from 'src/products/fetch-products.dto';
import { AddProductDto } from 'src/products/add-product.dto';
import { Product } from 'src/products/product.model';
import { EditProductDto } from 'src/products/edit-product.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly productsService: ProductsService,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<any> {
    if (!email || !name || !password) {
      throw new ForbiddenException('Fill all the fields');
    }
    const found = await this.userModel.findOne({ email });
    if (found) {
      throw new ConflictException('email already exists');
    }
    const hashPw = await hash(password, 12);
    const user = new this.userModel({
      name,
      email,
      password: hashPw,
    });
    try {
      const res = await user.save();
      return { id: res.id, name: res.name, email: res.email };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An error occured, try again later',
      );
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ email });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An error occured, try again later',
      );
    }
  }

  fetchUserProducts(
    fetchProductsFilter: FetchProductsFilter,
    user: User,
  ): Promise<Product[]> {
    return this.productsService.fetchUserProducts(fetchProductsFilter, user);
  }

  addProduct(addProductDto: AddProductDto, user: User): Promise<void> {
    return this.productsService.addProduct(addProductDto, user);
  }

  editProduct(
    editProductDto: EditProductDto,
    id: string,
    user: User,
  ): Promise<void> {
    return this.productsService.editProduct(editProductDto, id, user);
  }

  deleteProduct(id: string, user: User): Promise<void> {
    return this.productsService.deleteProduct(id, user);
  }
}
