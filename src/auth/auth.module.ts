import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serialize';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    UsersModule,
    ProductsModule,
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
