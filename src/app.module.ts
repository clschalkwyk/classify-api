import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from "./auth/auth.module";
import {UserService} from './user/user.service';
import {AdvertService} from './advert/advert.service';
import {AdvertController} from './advert/advert.controller';
import {AdvertModule} from './advert/advert.module';
import {UserModule} from './user/user.module';
import {MessagesService} from './messages/messages.service';
import {MessagesModule} from './messages/messages.module';
import {MulterModule} from "@nestjs/platform-express";
import {v4 as uuidv4} from 'uuid';
import * as AWS from 'aws-sdk';
import * as multers3 from 'multer-s3';

var s3 = new AWS.S3();

@Module({
  imports: [
    AuthModule,
    AdvertModule,
    UserModule,
    MessagesModule,
    MulterModule.register({
      dest: 'uploads',
      storage: multers3({
        s3: s3,
        bucket: process.env.CLASSIFY_S3,
        acl: 'public-read',
        contentType: multers3.AUTO_CONTENT_TYPE,
        key: function (req: any, file, cb) {
          console.log("REQ", req);
          console.log("REQ USER", req.user);
          console.log("FILE", file);

          const ext = file.originalname.split('.').pop();
          const newFname = `${uuidv4()}.${ext}`;

          let key;
          if(req?.params?.tmpId){
            key = ['temp', req.params.tmpId,newFname,].join('/');
          }else{
            key = ['uploads', new Date().toISOString().slice(0,10),newFname,].join('/');
          }

          cb(null, key);
        }
      })
    })
  ],
  controllers: [AppController, AdvertController],
  providers: [AppService, UserService, AdvertService, MessagesService],
})
export class AppModule {
}
