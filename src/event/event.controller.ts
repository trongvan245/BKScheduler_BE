import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "@prisma/client";
import { CreateEventDto } from "./dto/create-event.dto";
import { Public } from "src/common/decorators";
import { UpdateEventDto } from "./dto/update-event.dto";

@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get("async")
  async asyncEvents() {
    console.log("EventController: asyncEvents");
    return this.eventService.syncEventsWithGoogleCalendar();
  }

  @Post()
  async createPersonalEvent(@Body() eventData: CreateEventDto) {
    return this.eventService.createEvent(eventData);
  }

  
  @Post()
  async createGroupEvent(@Body() eventData: CreateEventDto) {
    console.log("EventController: createEvent");
    return this.eventService.createEvent(eventData);
  }


  @Get(":id")
  async findEventById(@Param("id") eventId: string): Promise<Event | null> {
    console.log("EventController: findEventById");
    return this.eventService.findEventById(eventId);
  }

  @Get()
  async getAllEvents() {
    console.log("EventController: getAllEvents");
    return this.eventService.getAllEvents();
  }

  @Put(":id")
  async updateEvent(@Param("id") eventId: string, @Body() eventData: UpdateEventDto): Promise<Event> {
    return this.eventService.updateEvent(eventId, eventData);
  }

  @Delete(":id")
  async deleteEvent(@Param("id") eventId: string): Promise<Event> {
    return this.eventService.deleteEvent(eventId);
  }
}
