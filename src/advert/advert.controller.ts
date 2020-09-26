import {Controller, UseGuards, Post, Get, Delete, Query, Body, Request, Param, Res, Req, HttpStatus, UseInterceptors, UploadedFiles} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdvertService} from "./advert.service";
import {NewAdvertDto} from "./dto/newAdvert.dto";
import {FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import {NewImageDto} from "./dto/newImage.dto";

@Controller('advert')
export class AdvertController {
  constructor(private advertService: AdvertService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createAd(@Body() createAdDto: NewAdvertDto, @Request() req, @Res() res: any) {
    const newAdvert = await this.advertService.createAd(createAdDto, req.user);
    return res.status(HttpStatus.OK).json(newAdvert);
  }

  @UseGuards(JwtAuthGuard)
  @Post('indexAdvert')
  async indexAdvert(@Body() createAdDto: NewAdvertDto, @Request() req, @Res() res: any) {
    console.log("INDEX DOC");
    const newAdvert = await this.advertService.indexAdvert(createAdDto, req.user);
    return res.status(HttpStatus.OK).json(newAdvert);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  @Post('addImage/:tmpId')
  async addImage(@Body() body: any,
                 @UploadedFiles() file,
                 @Param('tmpId') tmpId: string,
                 @Req() req,
                 @Res() res: any) {

    console.log("UPLOADED FILE",file);
    const newAdvert = await this.advertService.addImage(tmpId, req.user, body, file);

    return res.status(HttpStatus.OK).json({ok: true, result: newAdvert});
  }

  @UseGuards(JwtAuthGuard)
  @Get('images/temp/:tmpId')
  async getTempImages(@Param('tmpId') tmpId: string,
                      @Req() req,
                      @Res() res: any) {
    const images = await this.advertService.getTempImages(tmpId, req.user);
    return res.status(HttpStatus.OK).json({ok: true, result: images});
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/temp/:tmpId/:id')
  async deleteTempImages(
    @Param('tmpId') tmpId: string,
    @Param('id') id: string,
    @Req() req,
    @Res() res: any) {
    const images = await this.advertService.deleteTempImage(tmpId, id, req.user);
    return res.status(HttpStatus.OK).json({ok: true, result: {tmpId, id}});
  }


  @UseGuards(JwtAuthGuard)
  @Get('my-ads')
  async getAds(@Request() req, @Res() res: any) {
    const ads = await this.advertService.userAds(req.user);
    return res.status(HttpStatus.OK).json(ads);
  }

  @Get('view/:id')
  async viewAd(@Request() req, @Res() res: any, @Param('id') id: string) {
    const advert = await this.advertService.getAd(id);
    return res.status(HttpStatus.OK).json(advert);
  }

  @Get('list')
  async listAds(
    @Request() req,
    @Res() res,
    @Query('country') country: string,
    @Query('advertType') advertType: string,
    @Query('province') province: string,
    @Query('suburb') suburb: string,
  ){
    const found = await this.advertService.list(advertType, country, province, suburb);
    return res.status(HttpStatus.OK).json(found);
  }
}
