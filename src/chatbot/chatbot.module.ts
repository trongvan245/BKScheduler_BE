import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { QueryService } from './query.service';
import { ActionService } from './action.service';
import { MessageService } from '../message/message.service';
import { LLMService } from './llm.service';
import { RetryService } from './retry.service';

@Module({
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    QueryService,
    ActionService,
    MessageService,
    LLMService,
    RetryService,
  ],
})
export class ChatbotModule {}