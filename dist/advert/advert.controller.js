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
const platform_express_1 = require("@nestjs/platform-express");
let AdvertController = class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
    }
    async createAd(createAdDto, req, res) {
        const newAdvert = await this.advertService.createAd(createAdDto, req.user);
        return res.status(common_1.HttpStatus.OK).json(newAdvert);
    }
    async indexAdvert(createAdDto, req, res) {
        console.log("INDEX DOC");
        const newAdvert = await this.advertService.indexAdvert(createAdDto, req.user);
        return res.status(common_1.HttpStatus.OK).json(newAdvert);
    }
    async addImage(body, file, tmpId, req, res) {
        console.log("UPLOADED FILE", file);
        const newAdvert = await this.advertService.addImage(tmpId, req.user, body, file);
        return res.status(common_1.HttpStatus.OK).json({ ok: true, result: newAdvert });
    }
    async getTempImages(tmpId, req, res) {
        const images = await this.advertService.getTempImages(tmpId, req.user);
        return res.status(common_1.HttpStatus.OK).json({ ok: true, result: images });
    }
    async deleteTempImages(tmpId, id, req, res) {
        const images = await this.advertService.deleteTempImage(tmpId, id, req.user);
        return res.status(common_1.HttpStatus.OK).json({ ok: true, result: { tmpId, id } });
    }
    async getAds(req, res) {
        const ads = await this.advertService.userAds(req.user);
        return res.status(common_1.HttpStatus.OK).json(ads);
    }
    async viewAd(req, res, id) {
        const advert = await this.advertService.getAd(id);
        return res.status(common_1.HttpStatus.OK).json(advert);
    }
    async listAds(req, res, country, province, suburb) {
        const found = await this.advertService.listByLocation(country, province, suburb);
        return res.status(common_1.HttpStatus.OK).json(found);
    }
    async listAdType(req, res, adType, propType) {
        const found = await this.advertService.listByAdvertType(adType, propType);
        return res.status(common_1.HttpStatus.OK).json(found);
    }
    async feed(res, stat) {
        const found = await this.advertService.getFeed(stat);
        return res.status(common_1.HttpStatus.OK).json({ 'results': found });
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
    common_1.Post('indexAdvert'),
    __param(0, common_1.Body()), __param(1, common_1.Request()), __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newAdvert_dto_1.NewAdvertDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "indexAdvert", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.UseInterceptors(platform_express_1.FilesInterceptor('file')),
    common_1.Post('addImage/:tmpId'),
    __param(0, common_1.Body()),
    __param(1, common_1.UploadedFiles()),
    __param(2, common_1.Param('tmpId')),
    __param(3, common_1.Req()),
    __param(4, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "addImage", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get('images/temp/:tmpId'),
    __param(0, common_1.Param('tmpId')),
    __param(1, common_1.Req()),
    __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "getTempImages", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Delete('images/temp/:tmpId/:id'),
    __param(0, common_1.Param('tmpId')),
    __param(1, common_1.Param('id')),
    __param(2, common_1.Req()),
    __param(3, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "deleteTempImages", null);
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
__decorate([
    common_1.Get('list/location'),
    __param(0, common_1.Request()),
    __param(1, common_1.Res()),
    __param(2, common_1.Query('country')),
    __param(3, common_1.Query('province')),
    __param(4, common_1.Query('suburb')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "listAds", null);
__decorate([
    common_1.Get('list/ad-type'),
    __param(0, common_1.Request()),
    __param(1, common_1.Res()),
    __param(2, common_1.Query('adType')),
    __param(3, common_1.Query('propType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "listAdType", null);
__decorate([
    common_1.Get('feed'),
    __param(0, common_1.Res()),
    __param(1, common_1.Query('stat')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertController.prototype, "feed", null);
AdvertController = __decorate([
    common_1.Controller('advert'),
    __metadata("design:paramtypes", [advert_service_1.AdvertService])
], AdvertController);
exports.AdvertController = AdvertController;
//# sourceMappingURL=advert.controller.js.map