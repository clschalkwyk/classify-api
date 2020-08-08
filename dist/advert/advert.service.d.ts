import * as AWS from 'aws-sdk';
import { NewAdvertDto } from './dto/newAdvert.dto';
export declare class AdvertService {
    parseIncoming(incoming: string): void;
    reformatNewAd(newAd: NewAdvertDto, user: any): {
        pk: any;
        sk: string;
        userId: any;
        createdAt: string;
        group: string;
        compKeyType: string;
        compKeyLocation: string;
        address: {
            province: string;
            city: string;
            suburb: string;
            street1: string;
            street2: string;
            postcode: string;
            country: string;
        };
        advertType: string;
        askingPrice: number;
        description: string;
        propertyType: string;
        stat: object;
        title: string;
        type: string;
    };
    createAd(newAd: NewAdvertDto, user: any): Promise<{
        pk: any;
        sk: string;
        userId: any;
        createdAt: string;
        group: string;
        compKeyType: string;
        compKeyLocation: string;
        address: {
            province: string;
            city: string;
            suburb: string;
            street1: string;
            street2: string;
            postcode: string;
            country: string;
        };
        advertType: string;
        askingPrice: number;
        description: string;
        propertyType: string;
        stat: object;
        title: string;
        type: string;
    }>;
    userAds(user: any): Promise<AWS.DynamoDB.DocumentClient.ItemList>;
    getAd(id: string): Promise<AWS.DynamoDB.DocumentClient.AttributeMap>;
}
