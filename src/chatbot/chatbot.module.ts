import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { HandleRequestService } from './handleRequest.service';

import { LLMService } from './llm.service';
import { RetryService } from './retry.service';
import { EventModule } from '../event/event.module';
import { MessageModule } from 'src/message/message.module';
import { GroupModule } from 'src/group/group.module';

@Module({
  imports: [EventModule, MessageModule, GroupModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    HandleRequestService,
    LLMService,
    RetryService,
  ],
})
export class ChatbotModule {}