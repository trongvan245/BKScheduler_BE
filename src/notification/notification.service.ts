import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateNotificationDto, UpdateNotificationDto } from "./dto";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(notification: CreateNotificationDto) {
    const { title, body, isRead, groupId } = notification;
    return this.prisma.notification.create({
      data: {
        title,
        body,
        isRead: isRead || false,
        groupId: groupId || null,
      },
    });
  }

  async getAllNotifications(user_id: string) {
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

    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [{ groupId: { in: groupIds } }],
      },
      orderBy: { createTime: "desc" },
    });
    
    return notifications;
  }

  async updateNotification(id: string, notification: UpdateNotificationDto) {
    const { title, body, isRead, groupId } = notification;
    return this.prisma.notification.update({
      where: { id },
      data: {
        title,
        body,
        isRead: isRead || false,
        groupId: groupId || null,
      },
    });
  }


  async devNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createTime: "desc" },
    });
  }

  @Cron('* * 2 * * *', {
    name: 'handleCronCreateNotification'
  }) // Every 2 minutes
  async handleCronCreateNotification() {
    console.log("Running cron job to check event notifications");

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Get events that are about to start in 10 minutes (with 1 minute window to avoid missing events)
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        startTime: {
          gte: tenMinutesFromNow,
          lt: new Date(tenMinutesFromNow.getTime() + 60 * 1000)
        },
        notifiedUpcoming: false, // Flag to avoid duplicate notifications
      },
      include: {
        group: true,
      }
    });

    // Get events that just started (within the last minute)
    const justStartedEvents = await this.prisma.event.findMany({
      where: {
        startTime: {
          gte: oneMinuteAgo,
          lte: now
        },
        notifiedStarted: false, // Flag to avoid duplicate notifications
      },
      include: {
        group: true,
      }
    });

    // Create notifications for upcoming events
    for (const event of upcomingEvents) {
      await this.prisma.$transaction([
        this.prisma.notification.create({
          data: {
            title: "Upcoming Event Reminder",
            body: `Event "${event.name}" will start in about 10 minutes`,
            isRead: false,
            groupId: event.group_id,
          },
        }),
        this.prisma.event.update({
          where: { id: event.id },
          data: { notifiedUpcoming: true },
        }),
      ]);
      console.log(`Created notification for upcoming event: ${event.name}`);
    }

    // Create notifications for just started events
    for (const event of justStartedEvents) {
      await this.prisma.$transaction([
        this.prisma.notification.create({
          data: {
            title: "Event Started",
            body: `Event "${event.name}" has started now`,
            isRead: false,
            groupId: event.group_id,
          },
        }),
        this.prisma.event.update({
          where: { id: event.id },
          data: { notifiedStarted: true },
        }),
      ]);
      console.log(`Created notification for started event: ${event.name}`);
    }
  }


}
