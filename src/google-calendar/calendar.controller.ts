import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { GoogleCalendarService } from "./calendar.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { Public } from "src/common/decorators";

@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}
  @Public()
  @Get("events")
  async listEvents() {
    return this.googleCalendarService.listEvents();
  }

  @Public()
  @Post("events")
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.googleCalendarService.createEvent(createEventDto);
  }

  @Public()
  @Patch("events/:id")
  async updateEvent(@Param("id") eventId: string, @Body() updateEventDto: Partial<CreateEventDto>) {
    return this.googleCalendarService.updateEvent(eventId, updateEventDto);
  }
  
  @Delete("events/:id")
  async deleteEvent(@Param("id") eventId: string) {
    await this.googleCalendarService.deleteEvent(eventId);
    return { message: "Event deleted successfully" };
  }
}
