import {Controller, UseGuards, Post, Get, Body, Request, Param, Res, Req,HttpStatus, UseInterceptors, UploadedFile} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdvertService} from "./advert.service";
import {NewAdvertDto} from "./dto/newAdvert.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {NewImageDto} from "./dto/newImage.dto";

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
    @Post('indexAdvert')
    async indexAdvert(@Body() createAdDto: NewAdvertDto, @Request() req, @Res() res: any){
        console.log("INDEX DOC");
        const newAdvert = await this.advertService.indexAdvert(createAdDto, req.user);
        return res.status(HttpStatus.OK).json(newAdvert);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('' ))
    @Post('addImage/:tmpId')
    async addImage(@Body() body: any,
                   @Param('tmpId') tmpId: string,
                   @Req() req,
                   @Res() res: any){

        console.log("ADD IMAGE");
        const newAdvert = await this.advertService.addImage(tmpId, req.user, body);
        return res.status(HttpStatus.OK).json({ok: true, result: newAdvert});
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
