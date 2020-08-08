import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import * as AWS from 'aws-sdk';
import {NewAdvertDto} from './dto/newAdvert.dto';

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class AdvertService {
    parseIncoming(incoming: string) {

    }

    reformatNewAd(newAd : NewAdvertDto, user: any){
        const created = new Date().toISOString();
        const {province, city, suburb, street1, street2, postcode, country} =  newAd;
        const {advertType, askingPrice, description, propertyType, stat, title, type} = newAd;
        const adId = uuidv4();
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

    async createAd(newAd: NewAdvertDto, user: any) {
        try {
            const newAdvert = this.reformatNewAd(newAd, user);

            await dynamodb.put({
                TableName: process.env.CLASSIFY_TABLE,
                Item: newAdvert
            }).promise();

            return newAdvert;
        }catch (e) {
            throw  new InternalServerErrorException(e);
        }
    }

    async userAds(user: any){
        try{
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                IndexName: 'userContentIdx',
                KeyConditionExpression: 'userId = :userId and begins_with(compKeyType, :begins)',
                ExpressionAttributeValues:{
                    ':userId' : user.id,
                    ':begins': 'CLOG#property'
                },
                ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
                ExpressionAttributeNames:{'#typ' : 'type'}
            }).promise();
            return result.Items;
        }catch (e){
            throw new InternalServerErrorException(e)
        }
    }

    async getAd(id: string){
        try{
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                KeyConditionExpression: 'pk = :pk and sk = :sk',
                ExpressionAttributeValues:{
                    ':pk' : id,
                    ':sk' : 'CATALOG'
                },
                ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
                ExpressionAttributeNames:{'#typ' : 'type'}
            }).promise();
            return result.Items[0];
        }catch (e){
            throw new NotFoundException(e);
        }
    }
}
