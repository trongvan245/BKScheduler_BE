import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Event, Prisma } from "@prisma/client";
import { CreateEventDto } from "./dto/create-event.dto";

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring,
        isComplete: data.isComplete,
        type: data.type,
        reminderTime: data.reminderTime,
        recurrentPattern: data.recurrentPattern,
        priority: data.priority,
        group_id: data.group_id, // Include group_id in the create query
      },
    });
  }
  async findEventById(eventId: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  async getAllEvents(): Promise<Event[]> {
    return this.prisma.event.findMany();
  }

  async updateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
    return this.prisma.event.update({
      where: { id: eventId },
      data,
    });
  }

  async deleteEvent(eventId: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id: eventId } });
  }
}
