import * as AWS from 'aws-sdk';
import { UserUpdateDto } from "./dto/updateUser.dto";
export declare class UserService {
    getUser(userId: string): Promise<AWS.DynamoDB.DocumentClient.AttributeMap>;
    updateUser(updateUser: UserUpdateDto, userId: string): Promise<import("aws-sdk/lib/request").PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>;
}
