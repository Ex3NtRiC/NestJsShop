import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
@Injectable()
export class IsAuthenticated implements CanActivate {
  logger = new Logger('Authentication Guard');
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`authenticating Request`);
    return request.isAuthenticated();
  }
}
