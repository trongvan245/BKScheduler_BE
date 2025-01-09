import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatRequest, ChatResponse, MessageDto, MessageHistory } from "./models/chatbot.model";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery } from "@nestjs/swagger";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";

@ApiTags("Chatbot") // Đánh dấu controller này thuộc nhóm "Chatbot" trong tài liệu API
@Controller("chatbot")
@ApiBearerAuth() // Yêu cầu xác thực bằng Bearer token
@UseGuards(AuthGuard("jwt"))
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiOperation({ summary: "Xử lý tin nhắn (Chat)" }) // Mô tả endpoint
  @ApiBody({ type: MessageDto, description: "Request body chứa message" }) // Mô tả request body
  @ApiResponse({ status: 201, description: "Trả về phản hồi từ chatbot", type: ChatResponse }) // Mô tả response thành công
  @ApiResponse({ status: 400, description: "Bad Request" }) // Mô tả lỗi 400
  @ApiResponse({ status: 401, description: "Unauthorized" }) // Mô tả lỗi 401
  async handleMessage(@GetUser() user: JwtPayLoad, @Body() message: MessageDto): Promise<ChatResponse> {
    const request: ChatRequest = { userId: user.sub, message: message.message }; // Tạo object request từ userId và message
    console.log(request);
    return this.chatbotService.processRequest(request);
  }

  @Get()
  @ApiOperation({ summary: "Lấy lịch sử tin nhắn" })
  @ApiResponse({ status: 200, description: "Trả về lịch sử tin nhắn", type: [MessageHistory] })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMessage(@GetUser() user: JwtPayLoad): Promise<MessageHistory[]> {
    return this.chatbotService.getMessage(user.sub);
  }

  @Delete() 
  @ApiOperation({ summary: "Xóa tin nhắn" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        messageId: { type: "string", example: "message456" },
      },
      required: ["messageId"],
    },
    description: "Request body chứa messageId",
  })
  @ApiResponse({ status: 200, description: "Xóa tin nhắn thành công" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  async deleteMessage(@GetUser() user: JwtPayLoad, @Body() messageId: string): Promise<any> {
    return this.chatbotService.deleteMessage(user.sub, messageId);
  }

  @Delete("all") 
  @ApiOperation({ summary: "Xóa lịch sử trò chuyện" })
  @ApiResponse({ status: 200, description: "Xóa tin nhắn thành công" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  async deleteMessageHistory(@GetUser() user: JwtPayLoad): Promise<any> {
    return this.chatbotService.deleteMessageHistory(user.sub);
  }
}
