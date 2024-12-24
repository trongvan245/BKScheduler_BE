import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { GoogleCalendarService } from "../google-calendar/calendar.service";
import { BadRequestException } from "@nestjs/common";

interface GoogleEvent {
  id: string;
  summary: string;
  description: string;
  isComplete: boolean;
  type: string;
  priority: number;
  createdTime: string;
  startTime: string;
  endTime: string;
  group_id: string | null;
}

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async syncEventsWithGoogleCalendar() {
    const userId = "1";

    const googleEvents: GoogleEvent[] = await this.googleCalendarService.listEvents(userId);
    console.log(googleEvents);
    googleEvents.forEach(async (event) => {
      const findEvent = await this.prisma.event.findUnique({
        where: {
          id: event.id,
        },
      });


      // Sync OPTIONAL
      if (!findEvent) {
        await this.prisma.event.create({
          data: {
            id: event.id,
            summary: event.summary,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            isComplete: false,
            type: "google_calendar",
            priority: 1,
          },
        });
      }
    });
    return { message: "Synced successfully" };
  }

  async createEvent(data: CreateEventDto) {
    const userId = "1";

    const startDate = new Date(data.startTime);
    startDate.setHours(startDate.getHours() - 7); // Adjust UTC to Ho Chi Minh

    const endDate = new Date(data.endTime);
    endDate.setHours(endDate.getHours() - 7); // Adjust UTC to Ho Chi Minh

    const calendarEvent = await this.googleCalendarService.createEvent(
      {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
      },
      userId,
    );

    const webEvent = await this.prisma.event.create({
      data: {
        id: calendarEvent.id,
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

    return webEvent;
  }

  async getAllEvents() {
    const userId = "1";

    const WebEvents = await this.prisma.event.findMany();
    const GoogleEvents = await this.googleCalendarService.listEvents(userId);

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

  async deleteEvent(eventId: string) {
    const userId = "1";

    const findEvent = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!findEvent) {
      throw new BadRequestException("Event not found.");
    }

    const event = await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    if (event.type === "google_calendar") {
      await this.googleCalendarService.deleteEvent(eventId, userId);
    }

    return event;
  }

  async updateEvent(eventId: string, data: Partial<CreateEventDto>) {
    const userId = "1";

    const findEvent = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!findEvent) {
      return null;
    }

    console.log(findEvent);

    const startDate = new Date(findEvent.startTime);
    startDate.setHours(startDate.getHours() - 7); // Adjust UTC to Ho Chi Minh

    const endDate = new Date(findEvent.endTime);
    endDate.setHours(endDate.getHours() - 7); // Adjust UTC to Ho Chi Minh

    const calendarEvent = await this.googleCalendarService.updateEvent(eventId, userId, {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
    });

    const event = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        summary: data.summary,
        description: data.description,
        startTime: startDate,
        endTime: endDate,
        isComplete: data.isComplete,
        type: data.type,
        priority: data.priority,
        group_id: data.group_id,
      },
    });

    return event;
  }
}
