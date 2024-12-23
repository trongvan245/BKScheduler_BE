import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { GoogleCalendarService } from "../google-calendar/calendar.service";

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async createEvent(data: CreateEventDto) {
    const webEvent = await this.prisma.event.create({
      data: {
        summary: data.summary,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        isComplete: data.isComplete,
        type: data.type,
        priority: data.priority,
        group_id: data.group_id, // Include group_id in the create query
      },
    });

    const calendarEvent = await this.googleCalendarService.createEvent({
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.startTime.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: data.startTime.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
    });

    return webEvent;
  }

  async getAllEvents() {
    const WebEvents = await this.prisma.event.findMany();
    const GoogleEvents = await this.googleCalendarService.listEvents();

    const events = [...WebEvents, ...GoogleEvents];

    // Sort events by startTime
    events.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return events;
  }

  async findEventById(eventId: string) {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }
}
