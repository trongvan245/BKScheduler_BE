import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtGuard } from "./common/guards";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { EventModule } from "./event/event.module";
import { UserModule } from "./user/user.module";
import { GoogleCalendarModule } from "./google-calendar/calendar.module";
import { ChatbotModule } from "./chatbot/chatbot.module";
import { GroupModule } from "./group/group.module";
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EventModule,
    UserModule,
    GoogleCalendarModule,
    ChatbotModule,
    GroupModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: JwtGuard }, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
