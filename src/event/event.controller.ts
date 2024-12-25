import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "@prisma/client";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { CreateEventDto, getAllGroupEventsDto, UpdateEventDto } from "./dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("events")
@Controller("events")
export class EventController {
  constructor(private eventService: EventService) {}

  // @Get("async")
  // async asyncEvents() {
  //   console.log("EventController: asyncEvents");
  //   return this.eventService.syncEventsWithGoogleCalendar();
  // }

  // @Post()
  // async createPersonalEvent(@Body() eventData: CreateEventDto) {
  //   return this.eventService.createEvent(eventData);
  // }

  // @Post()
  // async createGroupEvent(@Body() eventData: CreateEventDto) {
  //   console.log("EventController: createEvent");
  //   return this.eventService.createEvent(eventData);
  // }

  // @Get(":id")
  // async findEventById(@Param("id") eventId: string): Promise<Event | null> {
  //   console.log("EventController: findEventById");
  //   return this.eventService.findEventById(eventId);
  // }

  @ApiOperation({ summary: "Sync Google Calendar with App" })
  @Post("sync")
  async syncEvents(@GetUser() { sub }: JwtPayLoad) {
    const events = await this.eventService.syncUserEventsWithGoogleCalendar(sub);
    return { events };
  }

  @ApiOperation({ summary: "Get all user events" })
  @Get("getme")
  async getAllUserEvents(@GetUser() { sub }: JwtPayLoad) {
    const res = await this.eventService.getAllUserEvents(sub);
    return { events: res };
  }

  @ApiOperation({ summary: "Get all group events" })
  @Get("getgroup")
  async getAllGroupEvents(@GetUser() { sub }: JwtPayLoad, @Query() { group_id }: getAllGroupEventsDto) {
    const res = await this.eventService.getAllGroupEvents(sub, group_id);
    return { events: res };
  }

  @ApiOperation({ summary: "Get all events" })
  @Get("getall")
  async getAllEvents() {
    const res = await this.eventService.getAllEvents();
    return { events: res };
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
