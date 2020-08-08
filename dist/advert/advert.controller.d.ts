import { AdvertService } from "./advert.service";
import { NewAdvertDto } from "./dto/newAdvert.dto";
export declare class AdvertController {
    private advertService;
    constructor(advertService: AdvertService);
    createAd(createAdDto: NewAdvertDto, req: any, res: any): Promise<any>;
    getAds(req: any, res: any): Promise<any>;
    viewAd(req: any, res: any, id: string): Promise<any>;
}
