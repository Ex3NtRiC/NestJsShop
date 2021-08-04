import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  logger = new Logger('Authentication Module');
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`validating user with email: ${email}`);
      const user = await this.usersService.findOne(email);
      if (!user) {
        return null;
      }
      const matchPw: boolean = await compare(password, user.password);
      if (user && matchPw) {
        return user;
      }
      return null;
    } catch (err) {
      throw new InternalServerErrorException('Error occured, try again later!');
    }
  }
}
