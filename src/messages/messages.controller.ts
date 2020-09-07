import {Controller, UseGuards, Post, Body, Request, Res, HttpStatus} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {NewMessageDto} from "./dto/NewMessage.dto";
import {MessagesService} from "./messages.service";

@Controller('messages')
export class MessagesController {
  constructor(private messageService : MessagesService) {}

  @Post('new-message')
  async newMessage(@Body() newMessage: NewMessageDto, @Request() req, @Res() res){
     const result = await this.messageService.newMessage(newMessage, req.user?.id );
     return res.status(HttpStatus.ACCEPTED).json(result);
  }

}
