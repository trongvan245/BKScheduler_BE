import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "@prisma/client";
import { CreateEventDto } from "./dto/create-event.dto";
import { Public } from "src/common/decorators";
import { UpdateEventDto } from "./dto/update-event.dto";

@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Public()
  @Post()
  async createEvent(@Body() eventData: CreateEventDto) {
    return this.eventService.createEvent(eventData);
  }

  @Public()
  @Get(":id")
  async findEventById(@Param("id") eventId: string): Promise<Event | null> {
    return this.eventService.findEventById(eventId);
  }

  @Public()
  @Get()
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  // @Public()
  // @Put(":id")
  // async updateEvent(@Param("id") eventId: string, @Body() eventData: UpdateEventDto): Promise<Event> {
  //   return this.eventService.updateEvent(eventId, eventData);
  // }

  // @Public()
  // @Delete(":id")
  // async deleteEvent(@Param("id") eventId: string): Promise<Event> {
  //   return this.eventService.deleteEvent(eventId);
  // }
}
