import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../prisma/prisma.service";
import { MessageHistory } from "../chatbot/models/chatbot.model";
@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(userId: string): Promise<MessageHistory[]> {
    console.log(userId);
    return this.prisma.message.findMany({
      where: { userId: userId },
      orderBy: { createTime: "desc" },
    });
  }

  async saveMessage(messageData: Omit<MessageHistory, "id" | "createTime">) {
    try {
      console.log("Saving message to database");
      // Implement save to database logic
      await this.prisma.message.create({
        data: {
          id: uuidv4(),
          user: { connect: { id: messageData.userId } },
          text: messageData.text,
          textBot: messageData.textBot,
          response: messageData.response,
        },
      });
      console.log("Message saved to database");
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }

  async getMessageHistory(userId: string, limit = 10): Promise<MessageHistory[]> {
    return this.prisma.message.findMany({
      where: { userId },
      take: limit,
      orderBy: { createTime: "desc" },
    });
  }

  async deleteMessage(userId, messageId) {
    return this.prisma.message.delete({
      where: { id: messageId, userId },
    });
  }
}
