import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {CreateUserDto} from "./dto/createUser.dto";
import * as AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import {toHash as toHashCrypt, compare as compareCrypt} from "../lib/Crypt";

//const scryptAsync = promisify(scrypt);

const {IS_OFFLINE} = process.env;
const CLASSIFY_TABLE_NAME = (IS_OFFLINE === 'true' ? 'ClassifyTable-dev' : process.env.CLASSIFY_TABLE);

console.log("IS OFFLINE: ", IS_OFFLINE);

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService
    ) {
        console.log(process.env);
    }

    async toHash(password: string) {
        // const salt = randomBytes(16).toString('hex');
        // const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        const hashed = await toHashCrypt(password);
        return hashed;
    }

    async compare(storedPassword: string, suppliedPassword: string) : Promise<boolean>{
//        const [hashedPassword, salt] = storedPassword.split('.');
  //      const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        const res = await compareCrypt(storedPassword, suppliedPassword);
        return Promise.resolve(res);
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const result = await dynamodb.query({
            TableName: CLASSIFY_TABLE_NAME,
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
                return Promise.resolve({email: result?.Items[0].email, sub: result?.Items[0].pk});
            }
        }
        return Promise.resolve(null);
    }

    async login(user: any) {
        const payload = {email: user.email, sub: user.sub};
        console.log("login:", payload);
        return this.jwtService.sign(payload);
    }

    async userExists(email: string): Promise<boolean>{
        try {
            const result = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                IndexName: 'emailIdx',
                KeyConditionExpression: 'email = :email and sk = :sk',
                ExpressionAttributeValues:{
                    ':email': email.trim(),
                    ':sk' : 'AUTH'
                }
            }).promise();
            const user = result?.Items[0];

            return Promise.resolve(user?.email === email);
        }catch(err){
            throw new InternalServerErrorException(err);
        }

        return Promise.resolve(false);
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
                TableName: CLASSIFY_TABLE_NAME,
                Item: params
            }).promise();
        }catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
}
