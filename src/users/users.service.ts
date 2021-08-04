import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { cart, User } from './user.model';
import { hash } from 'bcrypt';
import { ProductsService } from 'src/products/products.service';
import { FetchProductsFilter } from 'src/products/fetch-products.dto';
import { AddProductDto } from 'src/products/add-product.dto';
import { Product } from 'src/products/product.model';
import { EditProductDto } from 'src/products/edit-product.dto';
import { productStatus } from 'src/products/product-status.enum';

@Injectable()
export class UsersService {
  logger = new Logger('Users Service');
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
      this.logger.log('creating user');
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
      this.logger.log(`finding user by email: ${email}`);
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

  async getCart(user: User): Promise<cart | string> {
    const u: User = await this.findOne(user.email);
    if (!u) {
      throw new UnauthorizedException();
    }
    this.logger.log('fetching cart');
    const cart: cart = u.cart;
    if (cart.items.length > 0) {
      return cart;
    }
    return 'Your cart is empty';
  }

  async addToCart(
    prodId: string,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    quantity: number = 1,
    user: User,
  ): Promise<void> {
    const product: Product = await this.productsService.findOne(prodId);
    if (!product) {
      throw new NotFoundException('No such product!');
    }
    if (product.status === productStatus.PRODUCT_SOLD) {
      throw new ConflictException('Product is Sold out!');
    }
    const u: User = await this.findOne(user.email);
    if (!u) {
      throw new UnauthorizedException();
    }
    const itemIndex: number = this.itemIndex(prodId, u);
    if (itemIndex > -1) {
      this.logger.log('Adding an existing product to cart');
      u.cart.items[itemIndex].quantity += quantity;
    } else {
      this.logger.log('Adding a new product to cart');
      u.cart.items.push({ product: new Types.ObjectId(prodId), quantity });
    }
    try {
      await u.save();
    } catch (err) {
      throw new InternalServerErrorException(
        'Error occured, pelase try again later!',
      );
    }
  }

  async removeFromCart(prodId: string, user: User): Promise<void> {
    const product: Product = await this.productsService.findOne(prodId);
    if (!product) {
      throw new NotFoundException('No such product!');
    }
    const u: User = await this.findOne(user.email);
    const itemIndex: number = this.itemIndex(prodId, u);
    if (itemIndex > -1) {
      this.logger.log(`removing ${prodId} from cart`);
      u.cart.items.splice(itemIndex, 1);
      await u.save();
    } else {
      throw new NotFoundException("You don't have such a product in ur cart");
    }
  }

  itemIndex(prodId, user: User): number {
    const itemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === prodId,
    );
    return itemIndex;
  }
}
