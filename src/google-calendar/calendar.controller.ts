import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { GoogleCalendarService } from "./calendar.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { Public } from "src/common/decorators";

@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}
  @Public()
  @Get("events/user/:userId")
  async listEvents(@Param("userId") userId: string) {
    return this.googleCalendarService.listEvents(userId);
  }

  @Public()
  @Post("events/user/:userId")
  async createEvent(@Param("userId") userId: string, @Body() createEventDto: CreateEventDto) {
    return this.googleCalendarService.createEvent(createEventDto, userId);
  }

  @Public()
  @Patch("events/user/:userId/event:id")
  async updateEvent(
    @Param("id") eventId: string,
    @Param("userId") userId: string,
    @Body() updateEventsDto: Partial<CreateEventDto>,
  ) {
    return this.googleCalendarService.updateEvent(eventId, userId, updateEventsDto);
  }

  @Delete("events/user/:userId/event:id")
  async deleteEvent(@Param("id") eventId: string, @Param("userId") userId: string) {
    await this.googleCalendarService.deleteEvent(eventId, userId);
    return { message: "Event deleted successfully" };
  }
}
