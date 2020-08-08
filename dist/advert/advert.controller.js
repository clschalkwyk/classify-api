"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const advert_service_1 = require("./advert.service");
const newAdvert_dto_1 = require("./dto/newAdvert.dto");
let AdvertController = class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
    }
    async createAd(createAdDto, req, res) {
        const newAdvert = await this.advertService.createAd(createAdDto, req.user);
        return res.status(common_1.HttpStatus.OK).json(newAdvert);
    }
    async getAds(req, res) {
        const ads = await this.advertService.userAds(req.user);
        return res.status(common_1.HttpStatus.OK).json(ads);
    }
    async viewAd(req, res, id) {
        const advert = await this.advertService.getAd(id);
        return res.status(common_1.HttpStatus.OK).json(advert);
    }
};
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post('create'),
    __param(0, common_1.Body()), __param(1, common_1.Request()), __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newAdvert_dto_1.NewAdvertDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "createAd", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get('my-ads'),
    __param(0, common_1.Request()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "getAds", null);
__decorate([
    common_1.Get('view/:id'),
    __param(0, common_1.Request()), __param(1, common_1.Res()), __param(2, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "viewAd", null);
AdvertController = __decorate([
    common_1.Controller('advert'),
    __metadata("design:paramtypes", [advert_service_1.AdvertService])
], AdvertController);
exports.AdvertController = AdvertController;
//# sourceMappingURL=advert.controller.js.map