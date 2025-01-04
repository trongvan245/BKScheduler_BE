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
  ): Promise<ChatResponse> {
    return this.chatbotService.processRequest(request);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMessage(
    @Body() body: { userId: string } // Chỉ định kiểu body là một object
  ): Promise<MessageHistory[]> {
    return this.chatbotService.getMessage(body.userId); // Lấy userId từ object
  }
  

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteMessage(
    @Body() body: { userId: string; messageId: string }
  ): Promise<any> {
    const { userId, messageId } = body; // Trích xuất các giá trị từ body
    return this.chatbotService.deleteMessage(userId, messageId);
  }
  
}