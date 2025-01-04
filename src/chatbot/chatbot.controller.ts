import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequest, ChatResponse, MessageHistory } from './models/chatbot.model';
import { AuthGuard } from '@nestjs/passport';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async handleMessage(
    @Body() request: ChatRequest,
    @Body() userId: string
  ): Promise<ChatResponse> {
    return this.chatbotService.processRequest(userId, request);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMessage(
    @Body() userId: string
  ): Promise<MessageHistory[]> {
    return this.chatbotService.getMessage(userId);
  }

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteMessage(
    @Body() userId: string,
    @Body() messageId: string
  ): Promise<any> {
    return this.chatbotService.deleteMessage(userId, messageId);
  }
}