import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {NewMessageDto} from "./dto/NewMessage.dto";
import {v4 as uuid4}from 'uuid';
import * as AWS from "aws-sdk";
import MessageConfig from '../config/messages';

const {IS_OFFLINE} = process.env;
const CLASSIFY_TABLE_NAME = (IS_OFFLINE === 'true' ? 'ClassifyTable-dev' : process.env.CLASSIFY_TABLE);

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class MessagesService {

  async newMessage(newMessage: NewMessageDto, userId : string) {
    try {
      const pk = uuid4();
      const created = new Date().toISOString();
      const msg = {
        pk,
        sk: 'ADMSG',
        group: 'MESSAGES',
        compKeyType: [
          'ADMSG',
          MessageConfig.NEW_MESSAGE_STATUS,
          newMessage.advert,
          pk
        ].join("#"),
        compKeyLocation: [
          'ADMSG',
          userId,
          newMessage.advert
        ].join("#"),
        status: MessageConfig.NEW_MESSAGE_STATUS,
        sentBy: userId,
        createdAt: created,
        data: newMessage
      };

      const params = {
        TableName: CLASSIFY_TABLE_NAME,
        Item: msg,
        ReturnValues: 'ALL_OLD'
      };
      const res = await dynamodb.put(params).promise();
      console.log(res);
      return {"result" : "ok"};
    }catch (e){
      throw new InternalServerErrorException(e);
    }
  }

  sendMessageToAdvertiser(){

  }
}
