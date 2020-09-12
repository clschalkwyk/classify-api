import {Injectable, InternalServerErrorException, NotFoundException, Req, Res} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import * as AWS from 'aws-sdk';
import {NewAdvertDto} from './dto/newAdvert.dto';


const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3bucket = process.env.CLASSIFY_S3;

const s3 = new AWS.S3();


@Injectable()
export class AdvertService {

  currentTempId = '';

  async deleteTempImage(tmpId: string, id: string, user: any) {
    try {
      const params = {
        TableName: process.env.CLASSIFY_TABLE,
        Key: {
          'pk': id,
          'sk': 'IMG'
        }
      };

      const img = await dynamodb.get(params).promise();
      if (
        img.Item?.pk === id &&
        img.Item?.group === tmpId &&
        img.Item?.userId === user.id
      ) {
        // this is my image
        const delResult = await dynamodb.delete({
          TableName: process.env.CLASSIFY_TABLE,
          Key: {
            'pk': id,
            'sk': 'IMG'
          }
        }).promise();

        const resDelete = await s3.deleteObject({
          Bucket: s3bucket,
          Key: img.Item?.filekey,
        }).promise();

        return true;
      }
      return false;
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getTempImages(tmpId: string, user: any) {
    try {
      const result = await dynamodb.query({
        TableName: process.env.CLASSIFY_TABLE,
        IndexName: 'compKeyTypeIdx',
        KeyConditionExpression: '#group = :grp and begins_with(compKeyType, :begins)',

        ExpressionAttributeNames: {'#rl': 'url', '#pos': 'position', '#group': 'group'},
        ExpressionAttributeValues: {
          ':grp': tmpId,
          ':begins': ['IMG', tmpId].join('#')
        },
        ProjectionExpression: '#rl, #pos, pk'
      }).promise();
      return result.Items;
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async addImage(tmpId: string, user: any, body: any, file: any) {

    const res = Promise.all( file.map(async (ff) => {
        const created = new Date().toISOString();
        const imgId = uuidv4();
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
          TableName: process.env.CLASSIFY_TABLE,
          Item: saveParams
        }).promise();

        return saveParams.url;
    }));

    return res;
  }


  async indexAdvert(newAd: NewAdvertDto, user: any) {
    console.log("TO ES", newAd);
  }

  reformatNewAd(newAd: NewAdvertDto, user: any) {
    const created = new Date().toISOString();
    const {province, city, suburb, street1, street2, postcode, country} = newAd;
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
    } catch (e) {
      throw  new InternalServerErrorException(e);
    }
  }

  async userAds(user: any) {
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
        ExpressionAttributeNames: {'#typ': 'type'}
      }).promise();
      return result.Items;
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getAd(id: string) {
    try {
      const result = await dynamodb.query({
        TableName: process.env.CLASSIFY_TABLE,
        KeyConditionExpression: 'pk = :pk and sk = :sk',
        ExpressionAttributeValues: {
          ':pk': id,
          ':sk': 'CATALOG'
        },
        ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
        ExpressionAttributeNames: {'#typ': 'type'}
      }).promise();
      return result.Items[0];
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
}
