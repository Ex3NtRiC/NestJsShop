import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UsersService } from './users/users.service';
import { Logger } from '@nestjs/common';
import { IsAuthenticated } from './auth/isAuth.guard';
@Controller()
export class AppController {
  logger = new Logger('App Controller');
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() body: { name: string; email: string; password: string }) {
    this.logger.log(`Signup ${body.name}`);
    this.logger.log('');
    const { name, email, password } = body;
    return this.userService.createUser(name, email, password);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Res() res: Response) {
    this.logger.log(`Login`);
    res.status(200).redirect('/products');
  }

  @UseGuards(IsAuthenticated)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
