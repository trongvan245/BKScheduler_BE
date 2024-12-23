import { IsString, IsOptional, IsBoolean, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class EventDateTime {
  @IsString()
  dateTime: string; // ISO 8601 date-time string

  @IsOptional()
  @IsString()
  timeZone?: string; // Optional time zone
}

class EventReminders {
  @IsOptional()
  @IsBoolean()
  useDefault: boolean; // Whether to use default reminders
}

export class CreateEventDto {
  @IsString()
  summary: string; // Event title

  @IsOptional()
  @IsString()
  description?: string; // Event description

  @IsOptional()
  @ValidateNested()
  @Type(() => EventDateTime)
  start?: EventDateTime; // Start time object

  @IsOptional()
  @ValidateNested()
  @Type(() => EventDateTime)
  end?: EventDateTime; // End time object

  @IsOptional()
  @ValidateNested()
  @Type(() => EventReminders)
  reminders?: EventReminders; // Reminders object
}
