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
import { OrdersService } from 'src/orders/orders.service';
import { Order } from 'src/orders/order.model';

@Injectable()
export class UsersService {
  logger = new Logger('Users Service');
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
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

  async test(id: string) {
    const users: User[] = await this.userModel.find({
      'cart.items.product': Types.ObjectId(id),
    });
    console.log('user', users);
  }

  async deleteProduct(id: string, user: User): Promise<void> {
    try {
      const exists: boolean = await this.productsService.hasProduct(id, user);
      if (exists) {
        const users: User[] = await this.userModel.find({
          'cart.items.product': Types.ObjectId(id),
        });
        if (users.length > 0) {
          await users.forEach((user) => this.removeFromCart(id, user));
        }
      }
      await this.productsService.deleteProduct(id, user);
    } catch (err) {
      throw new InternalServerErrorException(
        'Error Occured, please try again laster!',
      );
    }
  }

  async getCart(user: User): Promise<cart> {
    const u: User = await this.findOne(user.email);
    if (!u) {
      throw new UnauthorizedException();
    }
    this.logger.log('fetching cart');
    const cart: cart = u.cart;
    return cart;
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
    const additionPrice = +quantity * +product.price;
    const itemIndex: number = this.itemIndex(prodId, u);
    if (itemIndex > -1) {
      this.logger.log('Adding an existing product to cart');
      u.cart.items[itemIndex].quantity += quantity;
      u.cart.items[itemIndex].price += additionPrice;
    } else {
      this.logger.log('Adding a new product to cart');
      u.cart.items.push({
        product: new Types.ObjectId(prodId),
        quantity,
        price: additionPrice,
      });
    }
    try {
      if (!u.cart.total) {
        u.cart.total = 0;
      }
      u.cart.total += additionPrice;
      await u.save();
    } catch (err) {
      console.log(err);
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
      const price: number = u.cart.items[itemIndex].price;
      u.cart.total -= price;
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

  fetchOrders(user: User): Promise<Order[] | string> {
    return this.ordersService.fetchOrders(user);
  }

  async orderProducts(user: User): Promise<void> {
    const cart: cart = await this.getCart(user);
    if (!(cart.items.length > 0)) {
      throw new ForbiddenException('Cart is empty');
    }
    try {
      this.logger.log(`Creating a new Order for ${user.name}`);
      await this.ordersService.addOrder(cart, user);
      const u: User = await this.findOne(user.email);
      if (!u) {
        throw new UnauthorizedException();
      }
      u.cart.items = [];
      u.cart.total = 0;
      this.logger.log('Order is done');
      await u.save();
    } catch {
      throw new InternalServerErrorException(
        'Error occured, pelase try again later!',
      );
    }
  }
}
