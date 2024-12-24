import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageHistory } from '../chatbot/models/chatbot.model';
@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(messageData: Omit<MessageHistory, 'id' | 'timestamp'>): Promise<MessageHistory> {
    const message: MessageHistory = {
      timestamp: new Date(),
      ...messageData,
    };
    // Implement save to database logic
    this.prisma.message.create({data: message});
    return message;
  }

  async getMessageHistory(userId: string, limit = 10): Promise<MessageHistory[]> {
    return this.prisma.message.findMany({
      where: { userId },
      take: limit,
      orderBy: { createTime: 'desc' },
    });
  }

  async deleteMessage(userId, messageId) {
    return this.prisma.message.delete({
      where: { id: messageId, userId },
    });
  }

}