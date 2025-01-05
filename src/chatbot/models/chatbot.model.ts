import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export type RequestType = "query" | "action" | "group" | "unknown";

export class MessageDto {
  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Xin chào' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatRequest {
  @ApiProperty({ description: 'ID của người dùng', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Xin chào' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatResponse {
  @ApiProperty({ description: 'Phản hồi từ chatbot', example: 'Xin chào' })
  message: string; // Đổi tên thành text hoặc responseText

  @ApiProperty({ description: 'Kết quả từ các services', example: {}, required: false })
  data?: any; // Cần định nghĩa kiểu dữ liệu cụ thể

  @ApiProperty({ description: 'Trạng thái yêu cầu', example: 'success', enum: ['success', 'error'], required: false })
  status?: "success" | "error";
}

export class MessageHistory {
  @ApiProperty({ description: 'ID của tin nhắn', example: 'message123' })
  id: string;

  @ApiProperty({ description: 'ID của người dùng', example: 'user123' })
  userId: string;

  @ApiProperty({ description: 'Tin nhắn của người dùng', example: 'Xin chào' })
  text: string; // Đổi tên thành userMessage

  @ApiProperty({ description: 'Tin nhắn của người dùng được làm sạch', required: false, example: 'Xin chào!' })
  textBot?: string; // Đổi tên thành botResponse

  @ApiProperty({ description: 'Phản hồi của chatbot', example: 'Chào bạn!', required: false })
  response?: string; // Trường này có redundant với textBot không?

  @ApiProperty({ description: 'Thời gian tạo (ISO-8601)', example: '2023-12-28T15:32:51.609Z' })
  createTime: Date; // Có thể để Date nếu bạn lưu ở database, hoặc string nếu chỉ dùng để hiển thị

  @ApiProperty({ description: 'Lĩnh vực', required: false, example: 'event', enum: ['event', 'group', 'unknown'] })
  domain?: "event" | "group" | "unknown";

  @ApiProperty({ description: 'Hành động', required: false, example: 'createEvent' })
  action?: string;
}

export class MessageAnalysis {
  @ApiProperty({ description: 'Tin nhắn gốc từ người dùng', example: 'Tạo sự kiện họp nhóm lúc 9h sáng mai' })
  originalMessage: string;

  @ApiProperty({ description: 'Loại yêu cầu', example: 'action', enum: ['query', 'action', 'group', 'unknown'] })
  requestType: RequestType;

  @ApiProperty({ description: 'Tin nhắn đã được làm sạch', example: 'Tạo sự kiện họp nhóm lúc 9h sáng mai' })
  cleanedMessage: string;

  @ApiProperty({ description: 'Lĩnh vực của yêu cầu', example: 'event', enum: ['event', 'group', 'unknown'] })
  domain: "event" | "group" | "unknown";

  @ApiProperty({ description: 'Hành động', example: 'createPersonalEvent' })
  action: string;

  @ApiProperty({ description: 'Dữ liệu liên quan đến yêu cầu', required: false, example: {} })
  data?: any; // Cần định nghĩa kiểu dữ liệu cụ thể

  @ApiProperty({ description: 'Thông báo lỗi (nếu có)', required: false, example: 'Lỗi không xác định được yêu cầu' })
  messageError?: string;
}