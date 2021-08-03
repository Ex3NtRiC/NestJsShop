import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
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
