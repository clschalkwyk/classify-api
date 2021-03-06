"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_service_1 = require("./user/user.service");
const advert_service_1 = require("./advert/advert.service");
const advert_controller_1 = require("./advert/advert.controller");
const advert_module_1 = require("./advert/advert.module");
const user_module_1 = require("./user/user.module");
const messages_service_1 = require("./messages/messages.service");
const messages_module_1 = require("./messages/messages.module");
const platform_express_1 = require("@nestjs/platform-express");
const uuid_1 = require("uuid");
const AWS = require("aws-sdk");
const multers3 = require("multer-s3");
var s3 = new AWS.S3();
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            auth_module_1.AuthModule,
            advert_module_1.AdvertModule,
            user_module_1.UserModule,
            messages_module_1.MessagesModule,
            platform_express_1.MulterModule.register({
                dest: 'uploads',
                storage: multers3({
                    s3: s3,
                    bucket: process.env.CLASSIFY_S3,
                    acl: 'public-read',
                    contentType: multers3.AUTO_CONTENT_TYPE,
                    key: function (req, file, cb) {
                        var _a;
                        console.log("REQ", req);
                        console.log("REQ USER", req.user);
                        console.log("FILE", file);
                        const ext = file.originalname.split('.').pop();
                        const newFname = `${uuid_1.v4()}.${ext}`;
                        let key;
                        if ((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.tmpId) {
                            key = ['temp', req.params.tmpId, newFname,].join('/');
                        }
                        else {
                            key = ['uploads', new Date().toISOString().slice(0, 10), newFname,].join('/');
                        }
                        cb(null, key);
                    }
                })
            })
        ],
        controllers: [app_controller_1.AppController, advert_controller_1.AdvertController],
        providers: [app_service_1.AppService, user_service_1.UserService, advert_service_1.AdvertService, messages_service_1.MessagesService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map