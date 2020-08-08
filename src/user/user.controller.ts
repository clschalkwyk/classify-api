import {Body, Controller, Post, Get, UseGuards, Request, Res, HttpStatus} from '@nestjs/common';
import {UserService} from "./user.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UserUpdateDto} from "./dto/updateUser.dto";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Post('update')
    async updateProfile(@Body() updateUser: UserUpdateDto, @Request() req, @Res() res:any){
        const result = await this.userService.updateUser(updateUser, req.user.id);
        return res.status(HttpStatus.ACCEPTED).json(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async fetchProfile(@Request() req, @Res() res:any){
        const result = await this.userService.getUser(req.user.id);
        console.log("ME: ", result);
        return res.status(HttpStatus.OK).json(result);
    }
}
