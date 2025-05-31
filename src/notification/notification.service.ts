import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateNotificationDto } from "./dto";

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
  }

  async devNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createTime: "desc" },
    });
  }
}
