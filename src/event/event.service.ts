import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleCalendarService } from "../google-calendar/calendar.service";
import { CreateGroupEventDto, CreatePersonalEventDto, UpdateEventDto } from "./dto";

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
    // console.log(googleEvents);
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
            type: "EVENT", //TODO: change to null
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

  async createEvent(
    userId: string,
    groupID: string,
    data: CreatePersonalEventDto,
    users: { email: string; id: string }[] = [],
  ) {
    const startDate = new Date(data.startTime);

    const endDate = new Date(data.endTime);

    const attendees = users.filter((user) => user.id !== userId).map((user) => ({ email: user.email }));

    const calendarEvent = await this.googleCalendarService.createEvent(
      {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: startDate.toISOString(),
          // timeZone: "Asia/Ho_Chi_Minh",
        },
        end: {
          dateTime: endDate.toISOString(),
          // timeZone: "Asia/Ho_Chi_Minh",
        },
        attendees,
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
        group_id: groupID, // Include group_id in the create query
        ownerId: userId,
      },
    });

    return webEvent;
  }

  async createPersonalEvent(userId: string, data: CreatePersonalEventDto) {
    const { indiGroupId } = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        indiGroupId: true,
      },
    });
    const event = await this.createEvent(userId, indiGroupId, data);
    return event;
  }

  async createGroupEvent(userId: string, data: CreateGroupEventDto) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: data.group_id,
      },
    });

    if (!group) throw new NotFoundException("Group not found.");

    const users = await this.prisma.userGroup.findMany({
      where: {
        group_id: data.group_id,
      },
      select: {
        User: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const flattenedUsers = users.map((user) => user.User);

    const event = await this.createEvent(userId, data.group_id, data, flattenedUsers);
    return event;
  }

  async getAllEvents() {
    const events = await this.prisma.event.findMany();
    // Sort events by startTime
    events.sort((b, a) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return events;
  }
  async getAllUserEvents(user_id: string) {
    //TODO: toi uu truy van bang cach dat event co user_id tu dau
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

  async deleteEvent(userId: string, eventId: string) {
    const findEvent = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!findEvent) {
      throw new NotFoundException("Event not found.");
    }

    const event = await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    await this.googleCalendarService.deleteEvent(eventId, userId);

    return event;
  }

  async updateEvent(userId: string, eventId: string, data: UpdateEventDto) {
    const findEvent = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!findEvent) {
      throw new NotFoundException("Event not found.");
    }
    if (findEvent.ownerId !== userId) throw new ForbiddenException("You are not the owner of this event.");

    const startDate = new Date(data.startTime);

    const endDate = new Date(data.endTime);

    const updatedBody = {
      summary: data.summary ? data.summary : findEvent.summary,
      description: data.description ? data.description : findEvent.description,
      start: data.startTime ? { dateTime: startDate.toISOString() } : undefined,
      end: data.endTime ? { dateTime: endDate.toISOString() } : undefined,
      isRecurrence: data.isRecurring ? data.isRecurring : undefined,
      isComplete: data.isComplete ? data.isComplete : undefined,
      type: data.type ? data.type : undefined,
      priority: data.priority ? data.priority : undefined
    };

    const calendarEvent = await this.googleCalendarService.updateEvent(eventId, userId, updatedBody);

    const event = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: updatedBody,
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

  //action needed userId, can get from @GetUser() { sub }: JwtPayLoad
  async actionEvent(event, data) {
    switch (event) {
      case "create":
      // return this.createEvent(data);
      case "update":
      // return this.updateEvent(data.id, data);
      case "delete":
      // return this.deleteEvent(data.id);
      default:
        return null;
    }
  }
}
