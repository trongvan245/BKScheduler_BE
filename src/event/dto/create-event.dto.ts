import { IsString, IsBoolean, IsDate, IsOptional, IsInt } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsBoolean()
  @IsOptional()
  isComplete?: boolean;

  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @IsOptional()
  reminderTime?: number;

  @IsString()
  @IsOptional()
  recurrentPattern?: string;

  @IsInt()
  @IsOptional()
  priority?: number;
}
