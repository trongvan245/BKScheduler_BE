import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async manageEvent(@Body() createChatDto: CreateChatDto) {
    return this.chatbotService.processChat(createChatDto);
  }
}
