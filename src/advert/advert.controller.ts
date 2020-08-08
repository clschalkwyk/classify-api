import {Controller, UseGuards, Post, Get, Body, Request, Param, Res, HttpStatus} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdvertService} from "./advert.service";
import {NewAdvertDto} from "./dto/newAdvert.dto";

@Controller('advert')
export class AdvertController {
    constructor(private advertService: AdvertService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createAd(@Body() createAdDto: NewAdvertDto, @Request() req, @Res() res: any){
        const newAdvert = await this.advertService.createAd(createAdDto, req.user);
        return res.status(HttpStatus.OK).json(newAdvert);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-ads')
    async getAds(@Request() req, @Res() res: any){
        const ads = await this.advertService.userAds(req.user);
        return res.status(HttpStatus.OK).json(ads);
    }

    @Get('view/:id')
    async viewAd(@Request() req, @Res() res: any, @Param('id') id: string){
        const advert = await this.advertService.getAd(id);
        return res.status(HttpStatus.OK).json(advert);
    }
}
