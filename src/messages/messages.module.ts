import {Module} from '@nestjs/common';
import {JwtStrategy} from "../auth/jwt.strategy";
import {MessagesService} from "./messages.service";
import {MessagesController} from './messages.controller';

@Module({
  imports: [JwtStrategy],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {
}
