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
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [auth_module_1.AuthModule, advert_module_1.AdvertModule],
        controllers: [app_controller_1.AppController, advert_controller_1.AdvertController],
        providers: [app_service_1.AppService, user_service_1.UserService, advert_service_1.AdvertService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map