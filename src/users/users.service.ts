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

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

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
      return await user.save();
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
}
