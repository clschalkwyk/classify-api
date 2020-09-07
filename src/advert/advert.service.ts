import {Injectable, InternalServerErrorException, NotFoundException, Req, Res} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import * as AWS from 'aws-sdk';
import {NewAdvertDto} from './dto/newAdvert.dto';
import {NewImageDto} from "./dto/newImage.dto";
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import {tmpdir} from "os";

const dynamodb = new AWS.DynamoDB.DocumentClient();
// const s3bucket = 'dev-classify-coza-images-202009061338';
// const s3bucket = 'classify-api-dev-attachmentsbucket-hyqj0x8gcafv';
const s3bucket = process.env.CLASSIFY_S3;
const tmpDir = 'temp';

const s3 = new AWS.S3();


@Injectable()
export class AdvertService {
  parseIncoming(incoming: string) {

  }

  currentTempId = '';

  async addImage(advertImg: Express.Multer.File, tmpId: string, user: any, @Req() req,  @Res() res) {
    console.log("IMAGE tmpId", tmpId);
    console.log("IMAGE req", req);
    console.log("IMAGE filename", advertImg.originalname);
    console.log("IMAGE USER", user);
    const key: string = [tmpDir, tmpId, advertImg.originalname].join("/");
    this.currentTempId = tmpId;

    const params = {
      Body: advertImg.buffer,
      Bucket: s3bucket,
      ContentType: advertImg.mimetype,
      Key: key
    };

    console.log(params);

    try{
      this.upload(req, res, (error) => {
        if(error){
          console.log(error);
          return false;
        }
        console.log(req);
        return req.file.location;
      });
    }catch (error){
      console.log(error);
      return false;
    }
  }

  upload = multer({
    storage : multers3({
      s3: s3,
      bucket: s3bucket,
      acl: 'public-read',
      key: (req, file, cb) => {
        const nf = [tmpDir, this.currentTempId, file.originalname].join("/");
        console.log('NF : ', nf);
        cb(null, nf);
      }
    })
  }).any();

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
