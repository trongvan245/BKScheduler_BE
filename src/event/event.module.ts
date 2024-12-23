import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { GoogleCalendarModule } from "src/google-calendar/calendar.module";

@Module({
  imports: [GoogleCalendarModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
