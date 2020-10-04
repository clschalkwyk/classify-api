import { AdvertService } from "./advert.service";
import { NewAdvertDto } from "./dto/newAdvert.dto";
export declare class AdvertController {
    private advertService;
    constructor(advertService: AdvertService);
    createAd(createAdDto: NewAdvertDto, req: any, res: any): Promise<any>;
    indexAdvert(createAdDto: NewAdvertDto, req: any, res: any): Promise<any>;
    addImage(body: any, file: any, tmpId: string, req: any, res: any): Promise<any>;
    getTempImages(tmpId: string, req: any, res: any): Promise<any>;
    deleteTempImages(tmpId: string, id: string, req: any, res: any): Promise<any>;
    getAds(req: any, res: any): Promise<any>;
    viewAd(req: any, res: any, id: string): Promise<any>;
    listAds(req: any, res: any, country: string, province: string, suburb: string): Promise<any>;
    listAdType(req: any, res: any, adType: string, propType: string): Promise<any>;
    feed(res: any, stat: any): Promise<any>;
}
