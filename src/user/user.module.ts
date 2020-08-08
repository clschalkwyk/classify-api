import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from "./user.service";
import {JwtStrategy} from "../auth/jwt.strategy";
import {AuthService} from "../auth/auth.service";
import {JwtService} from "@nestjs/jwt";


@Module({
    imports: [JwtStrategy],
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule {
}
