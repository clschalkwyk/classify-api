import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LocalStrategy} from "./local.strategy";
import {JwtStrategy} from "./jwt.strategy";
import {PassportModule} from "@nestjs/passport";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {jwtConstants} from './constants';
import { AuthController } from './auth.controller';


@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: '24h'
            }
        })
    ],
    providers: [LocalStrategy, JwtStrategy, AuthService],
    exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {
}
