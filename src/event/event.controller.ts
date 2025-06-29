import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common";
import { EventService } from "./event.service";
import { Event } from "@prisma/client";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { CreateGroupEventDto, CreatePersonalEventDto, getAllGroupEventsDto, UpdateEventDto } from "./dto";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetMeOkResponseDto } from "./dto/response.dto";

@ApiBearerAuth()
@ApiTags("Events")
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

  @ApiOperation({ summary: "Create personal event" })
  @Post()
  async createPersonalEvent(@GetUser() { sub }: JwtPayLoad, @Body() eventData: CreatePersonalEventDto) {
    return this.eventService.createPersonalEvent(sub, eventData);
  }

  @ApiOperation({ summary: "Create group event" })
  @Post("group")
  async createGrouplEvent(@GetUser() { sub }: JwtPayLoad, @Body() eventData: CreateGroupEventDto) {
    return this.eventService.createGroupEvent(sub, eventData);
  }

  @ApiOperation({ summary: "Get all user events(currently no filter)" })
  @ApiOkResponse({ description: "Get all user events succesfully", type: GetMeOkResponseDto })
  @Get("")
  async getAllUserEvents(@GetUser() { sub }: JwtPayLoad) {
    const res = await this.eventService.getAllUserEvents(sub);
    return { events: res };
  }

  @ApiOperation({ summary: "Get all group events" })
  @Get("group/:group_id")
  async getAllGroupEvents(@GetUser() { sub }: JwtPayLoad, @Param("group_id") group_id: string) {
    const res = await this.eventService.getAllGroupEvents(sub, group_id);
    return { events: res };
  }

  @ApiOperation({ summary: "Get all events from all user - development only" })
  @Get("dev")
  async getAllEvents() {
    const res = await this.eventService.getAllEvents();
    return { events: res };
  }

  @Put(":id")
  async updateEvent(@GetUser() { sub }: JwtPayLoad, @Param("id") eventId: string, @Body() eventData: UpdateEventDto) {
    return this.eventService.updateEvent(sub, eventId, eventData);
  }

  @Delete(":id")
  async deleteEvent(@GetUser() { sub }: JwtPayLoad, @Param("id") eventId: string): Promise<Event> {
    return this.eventService.deleteEvent(sub, eventId);
  }
}
