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
const propertyTypes = ['House', 'Apartment', 'Townhouse', 'Plot', 'Farm', 'Commercial Building', 'Industrial'];
const advertTypes = ['For Sale', 'To Rent'];
const { IS_OFFLINE } = process.env;
const CLASSIFY_TABLE_NAME = (IS_OFFLINE === 'true' ? 'ClassifyTable-dev' : process.env.CLASSIFY_TABLE);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3bucket = process.env.CLASSIFY_S3;
const s3 = new AWS.S3();
let AdvertService = class AdvertService {
    constructor() {
        this.currentTempId = '';
    }
    async deleteTempImage(tmpId, id, user) {
        var _a, _b, _c, _d;
        try {
            const params = {
                TableName: CLASSIFY_TABLE_NAME,
                Key: {
                    'pk': id,
                    'sk': 'IMG'
                }
            };
            const img = await dynamodb.get(params).promise();
            if (((_a = img.Item) === null || _a === void 0 ? void 0 : _a.pk) === id &&
                ((_b = img.Item) === null || _b === void 0 ? void 0 : _b.group) === tmpId &&
                ((_c = img.Item) === null || _c === void 0 ? void 0 : _c.userId) === user.id) {
                const delResult = await dynamodb.delete({
                    TableName: CLASSIFY_TABLE_NAME,
                    Key: {
                        'pk': id,
                        'sk': 'IMG'
                    }
                }).promise();
                const resDelete = await s3.deleteObject({
                    Bucket: s3bucket,
                    Key: (_d = img.Item) === null || _d === void 0 ? void 0 : _d.filekey,
                }).promise();
                return true;
            }
            return false;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async getTempImages(tmpId, user) {
        try {
            const result = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                IndexName: 'compKeyTypeIdx',
                KeyConditionExpression: '#group = :grp and begins_with(compKeyType, :begins)',
                ExpressionAttributeNames: { '#rl': 'url', '#pos': 'position', '#group': 'group' },
                ExpressionAttributeValues: {
                    ':grp': tmpId,
                    ':begins': ['IMG', tmpId].join('#')
                },
                ProjectionExpression: '#rl, #pos, pk'
            }).promise();
            return result.Items;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async addImage(tmpId, user, body, file) {
        const res = Promise.all(file.map(async (ff) => {
            const created = new Date().toISOString();
            const imgId = uuid_1.v4();
            const saveParams = {
                pk: imgId,
                sk: `IMG`,
                userId: user.id,
                createdAt: created,
                group: tmpId,
                compKeyType: [
                    "IMG",
                    tmpId,
                    imgId
                ].join("#"),
                imageData: ff,
                position: parseInt(body.position),
                url: ff.location,
                filename: ff.originalname,
                filekey: ff.key
            };
            console.log("SAVING IMG", saveParams);
            await dynamodb.put({
                TableName: CLASSIFY_TABLE_NAME,
                Item: saveParams
            }).promise();
            return saveParams.url;
        }));
        return res;
    }
    async indexAdvert(newAd, user) {
        console.log("TO ES", newAd);
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
            group: [
                'CATALOG',
                propertyType
            ].join('#'),
            compKeyType: [
                "T",
                newAd.advertType,
                adId
            ].join("#"),
            compKeyLocation: [
                "L",
                newAd.country,
                newAd.province,
                newAd.city,
                adId
            ].join("#"),
            address: {
                country,
                province,
                city,
                suburb,
                street1,
                street2,
                postcode
            },
            advertType, askingPrice, description, propertyType, stat, title, type
        };
        const ad_main = {
            pk: adId,
            sk: 'CATALOG',
            userId: user.id,
            createdAt: created,
            advertType,
            askingPrice,
            description,
            propertyType,
            stat,
            title,
            type
        };
        const ad_address = {
            pk: adId,
            sk: ['ADDRESS', country, province, city].join('#'),
            userId: user.id,
            createdAt: created,
            province,
            city,
            suburb,
            street1,
            street2,
            postcode,
            country
        };
        const ad_stat_count = Object.assign({ pk: adId, sk: 'STAT#COUNT', userId: user.id, createdAt: created }, stat.count);
        const ad_stat_has = Object.assign({ pk: adId, sk: 'STAT#HAS', userId: user.id, createdAt: created }, stat.has);
        const ad_stat_size = Object.assign({ pk: adId, sk: 'STAT#SIZE', userId: user.id, createdAt: created }, stat.size);
    }
    async createAd(newAd, user) {
        try {
            const newAdvert = this.reformatNewAd(newAd, user);
            await dynamodb.put({
                TableName: CLASSIFY_TABLE_NAME,
                Item: newAdvert
            }).promise();
            console.log("Added advert", JSON.stringify(newAdvert));
            return newAdvert;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async userAds(user) {
        try {
            const result = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
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
                TableName: CLASSIFY_TABLE_NAME,
                KeyConditionExpression: 'pk = :pk and sk = :sk',
                ExpressionAttributeValues: {
                    ':pk': id,
                    ':sk': 'CATALOG'
                },
                ProjectionExpression: 'advertType,createdAt,askingPrice,address,stat,description,pk,title, #typ',
                ExpressionAttributeNames: { '#typ': 'type' }
            }).promise();
            const resultGeo = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                KeyConditionExpression: 'pk = :pk and sk = :sk',
                ExpressionAttributeValues: {
                    ':pk': id,
                    ':sk': 'GEO'
                }
            }).promise();
            const res = Object.assign(Object.assign({}, result.Items[0]), { geo: resultGeo.Items[0]['data'][0]['geometry']['location'] });
            return res;
        }
        catch (e) {
            throw new common_1.NotFoundException(e);
        }
    }
    async getFeed(stat) {
        if (stat === 'BY_PROV' ||
            stat === 'BY_ADT_PT' ||
            stat === 'BY_PROV_PT') {
            const found = await dynamodb.query({
                IndexName: 'reverseIndexIdx',
                TableName: CLASSIFY_TABLE_NAME,
                KeyConditionExpression: '#pk = :pk',
                ExpressionAttributeNames: { '#pk': 'sk' },
                ExpressionAttributeValues: { ':pk': ['STATS', stat].join('#') }
            }).promise();
            let ids = found.Items.map((i) => {
                return { 'pk': i.pk, 'sk': 'CATALOG' };
            });
            const adlist = await dynamodb
                .batchGet({
                RequestItems: {
                    [CLASSIFY_TABLE_NAME]: { Keys: ids }
                }
            }).promise();
            return Promise.resolve(adlist['Responses'][CLASSIFY_TABLE_NAME]);
        }
        return Promise.resolve({});
    }
    async listByLocation(country, province, suburb) {
        try {
            country = 'ZA';
            let sk = [];
            sk.push('L');
            sk.push(country);
            if (province) {
                sk.push(province);
                if (suburb) {
                    sk.push(suburb);
                }
            }
            let pk = [];
            pk.push('CATALOG');
            let found;
            found = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                IndexName: 'advertCatalogIdx',
                KeyConditionExpression: '#pk = :pk and begins_with(#sk , :sk)',
                ExpressionAttributeNames: {
                    '#pk': 'sk',
                    '#sk': 'compKeyLocation',
                },
                ExpressionAttributeValues: {
                    ':pk': pk.join('#'),
                    ':sk': sk.join('#')
                },
            }).promise();
            return Promise.resolve(found.Items);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
    async listByAdvertType(adType, propType) {
        try {
            let pk = [];
            pk.push('CATALOG');
            if (propType && propertyTypes.indexOf(propType) > -1) {
                pk.push(propType);
            }
            else {
                pk.push(propertyTypes[0]);
            }
            let sk = [];
            sk.push('T');
            if (adType && advertTypes.indexOf(adType) > -1) {
                sk.push(adType);
            }
            else {
                sk.push(advertTypes[0]);
            }
            let found;
            found = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                IndexName: 'compKeyTypeIdx',
                KeyConditionExpression: '#pk = :pk and begins_with(#sk , :sk)',
                ExpressionAttributeNames: {
                    '#pk': 'group',
                    '#sk': 'compKeyType',
                },
                ExpressionAttributeValues: {
                    ':pk': pk.join('#'),
                    ':sk': sk.join('#')
                },
            }).promise();
            return Promise.resolve(found.Items);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e);
        }
    }
};
AdvertService = __decorate([
    common_1.Injectable()
], AdvertService);
exports.AdvertService = AdvertService;
//# sourceMappingURL=advert.service.js.map