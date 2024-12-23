import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(@Body() eventData: CreateEventDto): Promise<Event> {
    return this.eventService.createEvent(eventData);
  }

  @Get(':id')
  async findEventById(@Param('id') eventId: string): Promise<Event | null> {
    return this.eventService.findEventById(eventId);
  }

  @Get()
  async getAllEvents(): Promise<Event[]> {
    return this.eventService.getAllEvents();
  }

  @Put(':id')
  async updateEvent(@Param('id') eventId: string, @Body() eventData: Partial<Event>): Promise<Event> {
    return this.eventService.updateEvent(eventId, eventData);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') eventId: string): Promise<Event> {
    return this.eventService.deleteEvent(eventId);
  }
}
