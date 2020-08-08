import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {AuthModule} from "./auth/auth.module";
import { UserService } from './user/user.service';
import { AdvertService } from './advert/advert.service';
import { AdvertController } from './advert/advert.controller';
import { AdvertModule } from './advert/advert.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, AdvertModule, UserModule],
  controllers: [AppController, AdvertController],
  providers: [AppService, UserService, AdvertService],
})
export class AppModule {}
