import { IsString, IsBoolean, IsOptional, IsDate, IsInt } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

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
