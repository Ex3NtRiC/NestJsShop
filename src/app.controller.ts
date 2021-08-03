import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
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
  login(@Res() res: Response) {
    res.status(200).redirect('/products');
    return { message: 'Logged In' };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
