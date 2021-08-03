import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() body: { name: string; email: string; password: string }) {
    const { name, email, password } = body;
    return this.userService.createUser(name, email, password);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login() {
    return { message: 'Logged In' };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
