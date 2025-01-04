import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequest, ChatResponse, MessageHistory } from './models/chatbot.model';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Chatbot') // Đánh dấu controller này thuộc nhóm "Chatbot" trong tài liệu API
@Controller('chatbot')
@ApiBearerAuth() // Yêu cầu xác thực bằng Bearer token
@UseGuards(AuthGuard('jwt'))
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiOperation({ summary: 'Xử lý tin nhắn (Chat)' }) // Mô tả endpoint
  @ApiBody({ type: ChatRequest, description: 'Request body chứa userId và message' }) // Mô tả request body
  @ApiResponse({ status: 201, description: 'Trả về phản hồi từ chatbot', type: ChatResponse }) // Mô tả response thành công
  @ApiResponse({ status: 400, description: 'Bad Request' }) // Mô tả lỗi 400
  @ApiResponse({ status: 401, description: 'Unauthorized' }) // Mô tả lỗi 401
  async handleMessage(
    @Body() request: ChatRequest,
  ): Promise<ChatResponse> {
    return this.chatbotService.processRequest(request);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn' })
  @ApiQuery({ name: 'userId', description: 'ID của người dùng', type: String, required: true }) // Mô tả query parameter
  @ApiResponse({ status: 200, description: 'Trả về lịch sử tin nhắn', type: [MessageHistory] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMessage(
    @Query('userId') userId: string
  ): Promise<MessageHistory[]> {
    return this.chatbotService.getMessage(userId);
  }

  @Post('delete') // Sử dụng method POST để đồng nhất với request body
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        messageId: { type: 'string', example: 'message456' },
      },
      required: ['userId', 'messageId'],
    },
    description: 'Request body chứa userId và messageId',
  })
  @ApiResponse({ status: 200, description: 'Xóa tin nhắn thành công' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteMessage(
      @Body() body: { userId: string; messageId: string }
  ): Promise<any> {
      const { userId, messageId } = body; // Trích xuất các giá trị từ body
      return this.chatbotService.deleteMessage(userId, messageId);
  }
}