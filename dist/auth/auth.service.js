"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const AWS = require("aws-sdk");
const uuid_1 = require("uuid");
const Crypt_1 = require("../lib/Crypt");
const { IS_OFFLINE } = process.env;
const CLASSIFY_TABLE_NAME = (IS_OFFLINE === 'true' ? 'ClassifyTable-dev' : process.env.CLASSIFY_TABLE);
console.log("IS OFFLINE: ", IS_OFFLINE);
const dynamodb = new AWS.DynamoDB.DocumentClient();
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
        console.log(process.env);
    }
    async toHash(password) {
        const hashed = await Crypt_1.toHash(password);
        return hashed;
    }
    async compare(storedPassword, suppliedPassword) {
        const res = await Crypt_1.compare(storedPassword, suppliedPassword);
        return Promise.resolve(res);
    }
    async validateUser(email, pass) {
        const result = await dynamodb.query({
            TableName: CLASSIFY_TABLE_NAME,
            IndexName: 'emailIdx',
            KeyConditionExpression: 'email = :email and sk = :sk',
            ExpressionAttributeValues: {
                ':email': email.trim(),
                ':sk': 'AUTH'
            }
        }).promise();
        const { password } = result === null || result === void 0 ? void 0 : result.Items[0];
        if (password) {
            const passwordMatch = await this.compare(password, pass);
            if (passwordMatch) {
                return Promise.resolve({ email: result === null || result === void 0 ? void 0 : result.Items[0].email, sub: result === null || result === void 0 ? void 0 : result.Items[0].pk });
            }
        }
        return Promise.resolve(null);
    }
    async login(user) {
        const payload = { email: user.email, sub: user.sub };
        console.log("login:", payload);
        return this.jwtService.sign(payload);
    }
    async userExists(email) {
        try {
            const result = await dynamodb.query({
                TableName: CLASSIFY_TABLE_NAME,
                IndexName: 'emailIdx',
                KeyConditionExpression: 'email = :email and sk = :sk',
                ExpressionAttributeValues: {
                    ':email': email.trim(),
                    ':sk': 'AUTH'
                }
            }).promise();
            const user = result === null || result === void 0 ? void 0 : result.Items[0];
            return Promise.resolve((user === null || user === void 0 ? void 0 : user.email) === email);
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err);
        }
        return Promise.resolve(false);
    }
    async createUser(createUserDto) {
        const { email, password } = createUserDto;
        const params = {
            pk: uuid_1.v4(),
            sk: 'AUTH',
            password: await this.toHash(password),
            email: email.trim(),
            createdAt: new Date().toISOString()
        };
        try {
            await dynamodb.put({
                TableName: CLASSIFY_TABLE_NAME,
                Item: params
            }).promise();
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err);
        }
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map