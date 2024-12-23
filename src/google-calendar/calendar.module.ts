import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './calendar.service';
import { GoogleCalendarController } from './calendar.controller';

@Module({
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
  controllers: [GoogleCalendarController],
})
export class GoogleCalendarModule {}
