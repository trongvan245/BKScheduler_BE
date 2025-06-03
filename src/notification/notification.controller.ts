import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUser } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { CreateNotificationDto, UpdateNotificationDto } from "./dto";

@ApiBearerAuth()
@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post("")
  async createNotification(
    @GetUser() { sub }: JwtPayLoad,
    @Body() notification : CreateNotificationDto
  ) {
    return this.notificationService.createNotification(notification);
  }

  @Get("")
  async getAllNotifications(@GetUser() { sub }: JwtPayLoad) {
    return this.notificationService.getAllNotifications(sub);
  }

  @Get(":id")
  async getNotificationById(@GetUser() { sub }: JwtPayLoad, @Param('id') id: string) {
    return this.notificationService.getNotificationById(id);
  } 

  @Patch(":id")
  async updateNotification(
    @GetUser() { sub }: JwtPayLoad,
    @Param('id') id: string,
    @Body() notification: UpdateNotificationDto ) {
    return this.notificationService.updateNotification(id, notification);
  }

  @Get("dev")
  async devNotifications() {
    return this.notificationService.devNotifications();
  }
}
