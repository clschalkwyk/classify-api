import { Injectable } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {scrypt, randomBytes} from "crypto";
import {promisify} from "util";

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService
    ) {}

    async toHash(password: string){
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buf.toString('hex')}.${salt}`;
    }

    async compare(storedPassword: string, suppliedPassword: string){
        const [hashedPassword, salt] = storedPassword.split('.');
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;
    }


    async validateUser(email: string, pass: string): Promise<any>{

        // const user = await this.usersService.findOne(email);
        // console.log("Found USer: ",user);
        // if (user && user.password === pass){
        //     const { _id, email } = user;
        //     return { id: _id, email };
        // }

        return {
            id: 1,
            email: 'clschalkwyk@gmail.com'
        };
    }

    async login(user: any){
        const payload = {email: user.email, sub: user.id};
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
