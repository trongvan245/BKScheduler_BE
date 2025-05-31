import { Body, Controller, Get, Post } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUser } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { CreateNotificationDto } from "./dto";

@ApiBearerAuth()
@ApiTags("notification")
@Controller("notification")
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

  @Get("dev")
  async devNotifications() {
    return this.notificationService.devNotifications();
  }
}
