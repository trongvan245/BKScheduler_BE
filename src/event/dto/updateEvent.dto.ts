import { IsString, IsOptional, IsDate, IsBoolean, IsInt } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateEventDto {
  @ApiProperty({ description: "New Event summary", example: "Diffrent Summary" })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ description: "Event Description ", example: "Event Description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
  startTime?: Date;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
  endTime?: Date;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isComplete?: boolean;

  @ApiProperty({ example: "event_type" })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiProperty({ example: "b4b52058-da82-4e40-b0ea-f672b59a3f1d" })
  @IsString()
  @IsOptional()
  group_id?: string;

  // @ApiProperty({ example: "event_type" })
  // @IsString()
  // @IsOptional()
  // type?: string;

  // @IsInt()
  // @IsOptional()
  // reminderTime?: number;

  // @IsString()
  // @IsOptional()
  // recurrentPattern?: string;

  // @IsInt()
  // @IsOptional()
  // priority?: number;

  // @IsString()
  // @IsOptional()
  // group_id?: string;
}
