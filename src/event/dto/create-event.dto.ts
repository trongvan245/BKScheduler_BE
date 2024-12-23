import { IsString, IsOptional, IsDate, IsBoolean, IsInt } from "class-validator";
import { Transform } from "class-transformer";

export class CreateEventDto {
  @IsString()
  summary: string;

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
  isComplete?: boolean;

  @IsString()
  @IsOptional()
  type?: string;


  @IsInt()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  group_id?: string;
}
