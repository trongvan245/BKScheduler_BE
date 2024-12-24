import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequest, ChatResponse, MessageHistory } from './models/chatbot.model';
import { AuthGuard } from '@nestjs/passport';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @UseGuards(AuthGuard('jwt'))
  async handleMessage(@Body() request: ChatRequest): Promise<ChatResponse> {
    return this.chatbotService.processRequest(request);
  }

  @Get('history/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ): Promise<MessageHistory[]> {
    return this.chatbotService.getMessageHistory(userId, limit);
  }
}