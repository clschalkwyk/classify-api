import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
//import {scrypt, randomBytes} from "crypto";
import {promisify} from "util";
import {CreateUserDto} from "./dto/createUser.dto";
import * as AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import {toHash as toHashCrypt, compare as compareCrypt} from "../lib/Crypt";

//const scryptAsync = promisify(scrypt);


const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService
    ) {
    }

    async toHash(password: string) {
        // const salt = randomBytes(16).toString('hex');
        // const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        const hashed = await toHashCrypt(password);
        return hashed;
    }

    async compare(storedPassword: string, suppliedPassword: string) {
//        const [hashedPassword, salt] = storedPassword.split('.');
  //      const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        const res = await compareCrypt(storedPassword, suppliedPassword);
        return res;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const result = await dynamodb.query({
            TableName: process.env.CLASSIFY_TABLE,
            IndexName: 'emailIdx',
            KeyConditionExpression: 'email = :email and sk = :sk',
            ExpressionAttributeValues:{
                ':email': email.trim(),
                ':sk' : 'AUTH'
            }
        }).promise();

        const {password} = result?.Items[0];
        if(password) {
            const passwordMatch = await this.compare(password, pass);
            if (passwordMatch) {
                return {email: result?.Items[0].email, sub: result?.Items[0].pk};
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = {email: user.email, sub: user.sub};
        console.log("login:", payload);
        return this.jwtService.sign(payload);
    }

    async userExists(email: string){
        try {
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                IndexName: 'emailIdx',
                KeyConditionExpression: 'email = :email and sk = :sk',
                ExpressionAttributeValues:{
                    ':email': email.trim(),
                    ':sk' : 'AUTH'
                }
            }).promise();
            const user = result?.Items[0];

            return user?.email === email;
        }catch(err){
            throw new InternalServerErrorException(err);
        }
        return false;
    }

    async createUser(createUserDto: CreateUserDto) {
        const {email, password} = createUserDto;
        const params = {
            pk: uuidv4(),
            sk: 'AUTH',
            password: await this.toHash(password),
            email: email.trim(),
            createdAt: new Date().toISOString()
        }

        try {
            await dynamodb.put({
                TableName: process.env.CLASSIFY_TABLE,
                Item: params
            }).promise();
        }catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
}
