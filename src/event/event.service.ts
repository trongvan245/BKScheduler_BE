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

  async syncUserEventsWithGoogleCalendar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const googleEvents: GoogleEvent[] = await this.googleCalendarService.listEvents(userId);
    console.log(googleEvents);
    googleEvents.forEach(async (event) => {
      const findEvent = await this.prisma.event.findUnique({
        where: {
          id: event.id,
        },
      });

      if (!findEvent) {
        await this.prisma.event.create({
          data: {
            group_id: user.indiGroupId,
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

    const newUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isSync: true },
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
    const events = await this.prisma.event.findMany();
    // Sort events by startTime
    events.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return events;
  }
  async getAllUserEvents(user_id: string) {
    //toi uu truy van bang cach dat event co user_id tu dau
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    const userGroups = await this.prisma.userGroup.findMany({
      where: {
        user_id,
      },
      select: {
        group_id: true,
      },
    });
    const groupIds = userGroups.map((ug) => ug.group_id);
    groupIds.push(user.indiGroupId);
    // console.log(groupIds);
    const userEvents = await this.prisma.event.findMany({
      where: {
        group_id: {
          in: groupIds,
        },
      },
    });
    // Sort events by startTime
    userEvents.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return userEvents;
  }
  async getAllGroupEvents(user_id: string, group_id: string) {
    //check user co trong group khong
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    const userGroup = await this.prisma.userGroup.findFirst({
      where: {
        user_id,
        group_id,
      },
    });
    if (!userGroup && user.indiGroupId != group_id) throw new BadRequestException("User not in group.");

    const groupEvents = await this.prisma.event.findMany({
      where: {
        group_id,
      },
    });
    // Sort events by startTime
    groupEvents.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return groupEvents;
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

  async queryEvent(event, data) {
    switch (event) {
      case "list":
        return this.getAllEvents();
      case "find":
        return this.findEventById(data.id);
      default:
        return null;
    }
  }

  async actionEvent(event, data) {
    switch (event) {
      case "create":
        return this.createEvent(data);
      case "update":
        return this.updateEvent(data.id, data);
      case "delete":
        return this.deleteEvent(data.id);
      default:
        return null;
    }
  }
}
