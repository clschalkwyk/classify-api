import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from "./user.service";
import {JwtStrategy} from "../auth/jwt.strategy";


@Module({
  imports: [JwtStrategy],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {
}
