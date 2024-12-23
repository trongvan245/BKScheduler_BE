import { IsString, IsOptional, IsDate, IsBoolean, IsInt } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
  startTime?: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
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

  @IsString()
  @IsOptional()
  group_id?: string;
}
