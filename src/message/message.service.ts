import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        text: createMessageDto.content,
        userId: createMessageDto.sender,
        createTime: createMessageDto.timestamp || new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.message.findMany({ include: { user: true } });
  }

  async findOne(id: string) {
    return this.prisma.message.findUnique({ where: { id }, include: { user: true } });
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.prisma.message.update({
      where: { id },
      data: {
        text: updateMessageDto.content,
        userId: updateMessageDto.sender,
        createTime: updateMessageDto.timestamp,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.message.delete({ where: { id } });
  }
}