"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertModule = void 0;
const common_1 = require("@nestjs/common");
const advert_controller_1 = require("./advert.controller");
const advert_service_1 = require("./advert.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let AdvertModule = class AdvertModule {
};
AdvertModule = __decorate([
    common_1.Module({
        imports: [jwt_strategy_1.JwtStrategy],
        providers: [advert_service_1.AdvertService],
        controllers: [advert_controller_1.AdvertController]
    })
], AdvertModule);
exports.AdvertModule = AdvertModule;
//# sourceMappingURL=advert.module.js.map