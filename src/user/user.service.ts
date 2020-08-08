import {Inject, Injectable} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {UserUpdateDto} from "./dto/updateUser.dto";
import {toHash as toHashCrypt} from "../lib/Crypt";

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class UserService {

    async getUser(userId: string){
        const result = await dynamodb.query({
            TableName: process.env.CLASSIFY_TABLE,
            KeyConditionExpression: 'pk = :userId and sk = :sk',
            ExpressionAttributeValues:{
                ':userId': userId,
                ':sk' : 'AUTH'
            },
            ProjectionExpression: 'email, firstname, lastname, newsletter'
        }).promise();
        return result?.Items[0];
    }

    async updateUser(updateUser: UserUpdateDto, userId: string) {
        const {firstname, lastname, newsletter} = updateUser;

        let newPass = '';
        if (
            (updateUser.confirmpass && updateUser.newpass) &&
            (updateUser.confirmpass !== '' && updateUser.newpass !== '') &&
            (updateUser.newpass === updateUser.confirmpass)) {
            newPass = await toHashCrypt(updateUser.newpass);

            const res1 = await dynamodb.update({
                TableName: process.env.CLASSIFY_TABLE,
                Key:{
                    'pk': userId,
                    'sk': 'AUTH'
                },
                UpdateExpression: 'set password = :password',
                ExpressionAttributeValues:{
                    ':password' : newPass
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise();
        }

        const res = await dynamodb.update({
            TableName: process.env.CLASSIFY_TABLE,
            Key:{
                'pk': userId,
                'sk': 'AUTH'
            },
            UpdateExpression: 'set firstname = :firstname, ' +
                'lastname = :lastname, ' +
                'newsletter = :newsletter',
            ExpressionAttributeValues:{
                ':firstname' : updateUser.firstname,
                ':lastname' : updateUser.lastname,
                ':newsletter' : updateUser.newsletter
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();

        return res;
    }
}
