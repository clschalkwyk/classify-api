"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
const Crypt_1 = require("../lib/Crypt");
const dynamodb = new AWS.DynamoDB.DocumentClient();
let UserService = class UserService {
    async getUser(userId) {
        const result = await dynamodb.query({
            TableName: process.env.CLASSIFY_TABLE,
            KeyConditionExpression: 'pk = :userId and sk = :sk',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':sk': 'AUTH'
            },
            ProjectionExpression: 'email, firstname, lastname, newsletter'
        }).promise();
        return result === null || result === void 0 ? void 0 : result.Items[0];
    }
    async updateUser(updateUser, userId) {
        const { firstname, lastname, newsletter } = updateUser;
        let newPass = '';
        if ((updateUser.confirmpass && updateUser.newpass) &&
            (updateUser.confirmpass !== '' && updateUser.newpass !== '') &&
            (updateUser.newpass === updateUser.confirmpass)) {
            newPass = await Crypt_1.toHash(updateUser.newpass);
            const res1 = await dynamodb.update({
                TableName: process.env.CLASSIFY_TABLE,
                Key: {
                    'pk': userId,
                    'sk': 'AUTH'
                },
                UpdateExpression: 'set password = :password',
                ExpressionAttributeValues: {
                    ':password': newPass
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise();
        }
        const res = await dynamodb.update({
            TableName: process.env.CLASSIFY_TABLE,
            Key: {
                'pk': userId,
                'sk': 'AUTH'
            },
            UpdateExpression: 'set firstname = :firstname, ' +
                'lastname = :lastname, ' +
                'newsletter = :newsletter',
            ExpressionAttributeValues: {
                ':firstname': updateUser.firstname,
                ':lastname': updateUser.lastname,
                ':newsletter': updateUser.newsletter
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();
        return res;
    }
};
UserService = __decorate([
    common_1.Injectable()
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map