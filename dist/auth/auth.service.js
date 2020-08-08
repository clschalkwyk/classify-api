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
const dynamodb = new AWS.DynamoDB.DocumentClient();
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async toHash(password) {
        const hashed = await Crypt_1.toHash(password);
        return hashed;
    }
    async compare(storedPassword, suppliedPassword) {
        const res = await Crypt_1.compare(storedPassword, suppliedPassword);
        return res;
    }
    async validateUser(email, pass) {
        const result = await dynamodb.query({
            TableName: process.env.CLASSIFY_TABLE,
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
                return { email: result === null || result === void 0 ? void 0 : result.Items[0].email, sub: result === null || result === void 0 ? void 0 : result.Items[0].pk };
            }
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.sub };
        console.log("login:", payload);
        return this.jwtService.sign(payload);
    }
    async userExists(email) {
        try {
            const result = await dynamodb.query({
                TableName: process.env.CLASSIFY_TABLE,
                IndexName: 'emailIdx',
                KeyConditionExpression: 'email = :email and sk = :sk',
                ExpressionAttributeValues: {
                    ':email': email.trim(),
                    ':sk': 'AUTH'
                }
            }).promise();
            const user = result === null || result === void 0 ? void 0 : result.Items[0];
            return (user === null || user === void 0 ? void 0 : user.email) === email;
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err);
        }
        return false;
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
                TableName: process.env.CLASSIFY_TABLE,
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