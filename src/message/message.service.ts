import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MessageHistory } from '../chatbot/models/chatbot.model';
@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(messageData: Omit<MessageHistory, | 'id' | 'createTime'>) {
    // Implement save to database logic
    this.prisma.message.create({data: {
      id: uuidv4(),
      User: {connect: { id: messageData.userId}},
      text: messageData.text,
      textbot: messageData.textBot,
      response: messageData.response
    }});
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