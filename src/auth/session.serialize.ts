import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Logger } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  logger = new Logger('Serialization');
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    this.logger.log(`serialize user: ${user}`);
    done(null, user);
  }
  deserializeUser(payload: any, done: (err: Error, user: any) => void): any {
    this.logger.log(`deserialize payload`);
    done(null, payload);
  }
}
