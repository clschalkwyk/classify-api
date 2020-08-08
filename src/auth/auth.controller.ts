import {Controller, UseGuards, Post, Get, Body, Request, Res, HttpStatus} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalAuthGuard} from "./local-auth.guard";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {CreateUserDto} from "./dto/createUser.dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Res() res) {
        const token = await this.authService.login(req.user);
        res.cookie("token", token,{
            domain: null,
            httpOnly: true
        });
        return res.status(HttpStatus.OK).json({access_token: token });
        //return res.status(HttpStatus.OK).json({access_token: token });
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user
    }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto, @Res() res: any) {
        try {
            if (!(await this.authService.userExists(createUserDto.email))) {
                const newUser = await this.authService.createUser(createUserDto);
                return res.status(HttpStatus.OK).json({ok: true});
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ok: false, message: 'User exists'});
        } catch (e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: 'Error db',
                error: e
            });
        }
    }
}
