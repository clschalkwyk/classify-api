import { Module } from '@nestjs/common';
import {AdvertController} from "./advert.controller";
import {AdvertService} from "./advert.service";
import {JwtStrategy} from "../auth/jwt.strategy";

@Module({
    imports:[JwtStrategy],
    providers: [AdvertService],
    controllers: [AdvertController]
})
export class AdvertModule {
}
