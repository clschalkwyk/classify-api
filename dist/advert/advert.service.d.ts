import * as AWS from 'aws-sdk';
import { NewAdvertDto } from './dto/newAdvert.dto';
export declare class AdvertService {
    currentTempId: string;
    deleteTempImage(tmpId: string, id: string, user: any): Promise<boolean>;
    getTempImages(tmpId: string, user: any): Promise<AWS.DynamoDB.DocumentClient.ItemList>;
    addImage(tmpId: string, user: any, body: any, file: any): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    indexAdvert(newAd: NewAdvertDto, user: any): Promise<void>;
    reformatNewAd(newAd: NewAdvertDto, user: any): object;
    createAd(newAd: NewAdvertDto, user: any): Promise<any>;
    userAds(user: any): Promise<AWS.DynamoDB.DocumentClient.ItemList>;
    getAd(id: string): Promise<{
        geo: any;
    }>;
    getFeed(stat: string): Promise<any>;
    listByLocation(country: string, province: string, suburb: string): Promise<any>;
    listByAdvertType(adType: string, propType: string): Promise<any>;
}
