import { Injectable } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { EventService } from '../event/event.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventService: EventService,
  ) {}

  async processChat(createChatDto: CreateChatDto): Promise<any> {
    const { userId, message } = createChatDto;

    // Lấy lịch sử tin nhắn để tạo prompt
    const chatHistory = await this.messageService.findOne(userId);

    // Tạo prompt
    const prompt = `User: ${message}\nChatbot:`;

    // Gửi prompt cho mô hình AI để nhận câu trả lời
    const response = await this.generateResponse(prompt, chatHistory);

    // Nếu người dùng yêu cầu tạo lịch, gọi EventModule
    if (this.isEventRequest(message)) {
      const eventDetails = this.extractEventDetails(message);
      await this.eventService.createEvent(eventDetails);
    }

    // Lưu tin nhắn vào MessageModule
    await this.messageService.update(userId, message, response);

    return { response };
  }

  private async generateResponse(prompt: string, history: string[]): Promise<string> {
    // Giả lập tạo phản hồi từ mô hình AI (thực tế dùng OpenAI hoặc mô hình khác)
    return `This is a generated response based on: "${prompt}"`;
  }

  private isEventRequest(message: string): boolean {
    // Xác định tin nhắn có phải yêu cầu tạo lịch không
    return message.toLowerCase().includes('create event');
  }

  private extractEventDetails(message: string): any {
    // Giả lập phân tích message để lấy thông tin sự kiện
    return { title: 'Meeting', date: '2024-12-25', time: '10:00' };
  }
}
