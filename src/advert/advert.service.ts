import {Injectable, InternalServerErrorException, NotFoundException, Req, Res} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import * as AWS from 'aws-sdk';
import {NewAdvertDto} from './dto/newAdvert.dto';



const propertyTypes = ['House', 'Apartment', 'Townhouse', 'Plot', 'Farm', 'Commercial Building', 'Industrial'];
const advertTypes = ['For Sale', 'To Rent'];

const {IS_OFFLINE} = process.env;
const CLASSIFY_TABLE_NAME = (IS_OFFLINE === 'true' ? 'ClassifyTable-dev' : process.env.CLASSIFY_TABLE);

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3bucket = process.env.CLASSIFY_S3;

const s3 = new AWS.S3();


@Injectable()
export class AdvertService {

  currentTempId = '';

  async deleteTempImage(tmpId: string, id: string, user: any) {
    try {
      const params = {
        TableName: CLASSIFY_TABLE_NAME,
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
          TableName: CLASSIFY_TABLE_NAME,
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
        TableName: CLASSIFY_TABLE_NAME,
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

    const res = Promise.all(file.map(async (ff) => {
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
        TableName: CLASSIFY_TABLE_NAME,
        Item: saveParams
      }).promise();

      return saveParams.url;
    }));

    return res;
  }


  async indexAdvert(newAd: NewAdvertDto, user: any) {
    console.log("TO ES", newAd);
  }

  reformatNewAd(newAd: NewAdvertDto, user: any): object {
    const created = new Date().toISOString();
    const {province, city, suburb, street1, street2, postcode, country} = newAd;
    const {advertType, askingPrice, description, propertyType, stat, title, type} = newAd;
    const adId = uuidv4();

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

    const ad_stat_count = {
      pk: adId,
      sk: 'STAT#COUNT',
      userId: user.id,
      createdAt: created,
      ...stat.count
    };

    const ad_stat_has = {
      pk: adId,
      sk: 'STAT#HAS',
      userId: user.id,
      createdAt: created,
      ...stat.has
    };

    const ad_stat_size = {
      pk: adId,
      sk: 'STAT#SIZE',
      userId: user.id,
      createdAt: created,
      ...stat.size
    };
  }

  async createAd(newAd: NewAdvertDto, user: any) {
    try {
      const newAdvert: any = this.reformatNewAd(newAd, user);

      await dynamodb.put({
        TableName: CLASSIFY_TABLE_NAME,
        Item: newAdvert
      }).promise();

      const images = await dynamodb.query({
        TableName: CLASSIFY_TABLE_NAME,
        IndexName: 'compKeyTypeIdx',
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: {
          '#pk': 'group',
        },
        ExpressionAttributeValues: {
          ':pk': newAd['tmpId']
        },
      }).promise();

      let img;
      for (const img1 of images.Items) {
        var delParams = {
          TableName:CLASSIFY_TABLE_NAME,
          Key:{
            "pk": img1.pk,
            "sk": img1.sk
          },
        };

        img1.sk = ['IMAGE', img1.pk].join('#')
        img1.pk = newAdvert.pk;
        img1.group = 'IMAGES';

        await dynamodb.put({
          TableName: CLASSIFY_TABLE_NAME,
          Item: img1
        }).promise();

        //remove temp image
        const rem = await dynamodb.delete(delParams).promise();
      }
      return newAdvert;
    } catch (e) {
      throw  new InternalServerErrorException(e);
    }
  }

  async userAds(user: any) {
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
        TableName: CLASSIFY_TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and sk = :sk',
        ExpressionAttributeValues: {
          ':pk': id,
          ':sk': 'CATALOG'
        },
        ProjectionExpression: 'advertType,createdAt,askingPrice,address,stat,description,pk,title, #typ',
        ExpressionAttributeNames: {'#typ': 'type'}
      }).promise();

      const resultGeo = await dynamodb.query({
        TableName: CLASSIFY_TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and sk = :sk',
        ExpressionAttributeValues: {
          ':pk': id,
          ':sk': 'GEO'
        }
      }).promise();

      const res = {...result.Items[0], geo: resultGeo.Items[0]['data'][0]['geometry']['location']};
      return res;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async getFeed(stat: string): Promise<any> {

    if (
      stat === 'BY_PROV' ||
      stat === 'BY_ADT_PT' ||
      stat === 'BY_PROV_PT'
    ) {
      const found = await dynamodb.query({
        IndexName: 'reverseIndexIdx',
        TableName: CLASSIFY_TABLE_NAME,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: {'#pk': 'sk'},
        ExpressionAttributeValues: {':pk': ['STATS', stat].join('#')}
      }).promise();

      let ids = found.Items.map((i) => {
        return {'pk': i.pk, 'sk': 'CATALOG'};
      });

      const adlist = await dynamodb
        .batchGet(
          {
            RequestItems: {
              [CLASSIFY_TABLE_NAME]: {Keys: ids}
            }
          }
        ).promise();

      return Promise.resolve(adlist['Responses'][CLASSIFY_TABLE_NAME]);
    }

    return Promise.resolve({});
  }

  async listByLocation(country: string, province: string, suburb: string): Promise<any> {
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
        // ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
      }).promise();

      return Promise.resolve(found.Items);
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async listByAdvertType(adType: string, propType: string): Promise<any> {
    try {


      let pk = [];
      pk.push('CATALOG');
      if (propType &&  propertyTypes.indexOf(propType) > -1 ) {
        pk.push(propType);
      }else{
        pk.push(propertyTypes[0]);
      }

      let sk = [];
      sk.push('T');
      if(adType && advertTypes.indexOf(adType) > -1){
        sk.push(adType)
      }else{
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
        // ProjectionExpression: 'advertType,createdAt,address,stat,description,pk,title, #typ',
      }).promise();

      return Promise.resolve(found.Items);
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
}
