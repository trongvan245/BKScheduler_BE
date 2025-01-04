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
          timeZone: "Asia/Ho_Chi_Minh", // Bỏ comment
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "Asia/Ho_Chi_Minh", // Bỏ comment
        },
        attendees,
        recurrence: data.isRecurring ? ["RRULE:FREQ=DAILY;COUNT=1"] : null, // Cần xử lý logic cho recurrence
        status: "confirmed", // Xem xét lại logic isComplete và status
        extendedProperties: {
          private: {
            type: data.type || "EVENT",
            priority: data.priority ? data.priority.toString() : "1", // Nên xem xét lại
          },
        },
      },
      userId,
    );
  
    const webEvent = await this.prisma.event.create({
      data: {
        id: calendarEvent.id,
        summary: data.summary,
        description: data.description,
        startTime: startDate, // Sử dụng Date object
        endTime: endDate, // Sử dụng Date object
        isComplete: data.isComplete, // Nên xem xét lại
        type: data.type,
        priority: data.priority,
        group_id: groupID,
        ownerId: userId,
      },
    });
  
    return webEvent;
  }

  async createPersonalEvent(userId: string, data: CreatePersonalEventDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        indiGroupId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    if (!user.indiGroupId) {
      throw new BadRequestException(`User with id ${userId} does not have indiGroupId.`);
    }

    const event = await this.createEvent(userId, user.indiGroupId, data);
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

    const usersEmail = await this.prisma.userGroup.findMany({
      where: {
        group_id: findEvent.group_id,
      },
      select: {
        User: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });

    const flattenedUsersEmail = usersEmail
      .filter((user) => user.User.id !== userId)
      .map((user) => ({ email: user.User.email }));

    const startDate = data.startTime ? new Date(data.startTime) : new Date(findEvent.startTime);

    const endDate = data.endTime ? new Date(data.endTime) : new Date(findEvent.endTime);

    const calendarEvent = await this.googleCalendarService.updateEvent(eventId, userId, {
      summary: data.summary,
      description: data.description,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      recurrence: data.isRecurring ? ["RRULE:FREQ=DAILY;COUNT=1"] : null,
      attendees: flattenedUsersEmail,
      status: data.isComplete ? "confirmed" : "tentative",
      extendedProperties: {
        private: {
          type: data.type || findEvent.type,
          priority: data.priority ? data.priority.toString() : findEvent.priority.toString(),
        },
      },
    });

    const event = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        summary: data.summary,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        isComplete: data.isComplete,
        type: data.type,
        priority: data.priority,
      },
    });

    return event;
  }

  async queryEvent(userId: string, action: string, data?: any) {
    switch (action) {
      case "listAll":
        return this.getAllEvents();
      case "listUserEvents":
        if (!data || !userId) {
          throw new BadRequestException("Missing userId for listUserEvents");
        }
        return this.getAllUserEvents(userId);
      case "listGroupEvents":
        if (!data || !data.userId || !data.groupId) {
          throw new BadRequestException("Missing userId or groupId for listGroupEvents");
        }
        return this.getAllGroupEvents(userId, data.groupId);
      case "findById":
        if (!data || !data.eventId) {
          throw new BadRequestException("Missing eventId for findById");
        }
        return this.findEventById(data.eventId);
      default:
        throw new BadRequestException("Invalid query action");
    }
  }

  //action needed userId, can get from @GetUser() { sub }: JwtPayLoad
  async actionEvent(userId: string, action: string, data?: any) {
    switch (action) {
      case "sync":
        return this.syncUserEventsWithGoogleCalendar(userId);
      case "createPersonalEvent":
        if (!data) {
          throw new BadRequestException("Missing data for createPersonalEvent");
        }
        return this.createPersonalEvent(userId, data);
      case "createGroupEvent":
        if (!data) {
          throw new BadRequestException("Missing data for createGroupEvent");
        }
        return this.createGroupEvent(userId, data);
      case "update":
        if (!data || !data.eventId) {
          throw new BadRequestException("Missing eventId for update");
        }
        return this.updateEvent(userId, data.eventId, data);
      case "delete":
        if (!data || !data.eventId) {
          throw new BadRequestException("Missing eventId for delete");
        }
        return this.deleteEvent(userId, data.eventId);
      default:
        throw new BadRequestException("Invalid action");
    }
  }
}
