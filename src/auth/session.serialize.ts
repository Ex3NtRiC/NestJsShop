import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Logger } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  logger = new Logger('Serialization');
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    this.logger.log(`serialize user: ${user.name}`);
    done(null, { id: user.id, email: user.email, name: user.name });
  }
  deserializeUser(payload: any, done: (err: Error, user: any) => void): any {
    this.logger.log(`deserialize payload`);
    console.log(payload);
    done(null, payload);
  }
}
