"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
let AdvertService = class AdvertService {
    parseIncoming(incoming) {
    }
    reformatNewAd(newAd, user) {
        const created = new Date().toISOString();
        const { province, city, suburb, street1, street2, postcode, country } = newAd;
        const { advertType, askingPrice, description, propertyType, stat, title, type } = newAd;
        const adId = uuid_1.v4();
        return {
            pk: adId,
            sk: 'CATALOG',
            userId: user.id,
            createdAt: created,
            group: `CATALOG#${type}`,
            compKeyType: [
                "CLOG",
                newAd.type,
                newAd.advertType,
                adId
            ].join("#"),
            compKeyLocation: [
                "CLOG",
                newAd.type,
                newAd.province,
                newAd.city,
                newAd.suburb,
                adId
            ].join("#"),
            address: {
                province, city, suburb, street1, street2, postcode, country
            },
            advertType, askingPrice, description, propertyType, stat, title, type
        };
    }
    async createAd(newAd, user) {
        try {
            const newAdvert = this.reformatNewAd(newAd, user);
            await dynamodb.put({
                TableName: process.env.CLASSIFY_TABLE,
                Item: newAdvert
            }).promise();
            return newAdvert;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async userAds(user) {
        try {
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                IndexName: 'userContentIdx',
                KeyConditionExpression: 'userId = :userId and begins_with(compKeyType, :begins)',
                ExpressionAttributeValues: {
                    ':userId': user.id,
                    ':begins': 'CLOG#property'
                },
                ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
                ExpressionAttributeNames: { '#typ': 'type' }
            }).promise();
            return result.Items;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async getAd(id) {
        try {
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                KeyConditionExpression: 'pk = :pk and sk = :sk',
                ExpressionAttributeValues: {
                    ':pk': id,
                    ':sk': 'CATALOG'
                },
                ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
                ExpressionAttributeNames: { '#typ': 'type' }
            }).promise();
            return result.Items[0];
        }
        catch (e) {
            throw new common_1.NotFoundException(e);
        }
    }
};
AdvertService = __decorate([
    common_1.Injectable()
], AdvertService);
exports.AdvertService = AdvertService;
//# sourceMappingURL=advert.service.js.map