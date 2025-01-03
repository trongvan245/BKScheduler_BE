import { IsString, IsOptional, IsDate, IsBoolean, IsInt, IsEnum, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { EVENT_TYPE } from "@prisma/client";
import { IsEventType } from "../decorators";

export class CreatePersonalEventDto {
  @ApiProperty({ description: "Personal Event", example: "Personal Event" })
  @IsString()
  summary: string;

  @ApiProperty({ description: "Personal Event Description ", example: "Personal Event Description" })
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

  @ApiProperty({ example: "EVENT" })
  @IsEventType()
  @IsOptional()
  type?: EVENT_TYPE;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  priority?: number;
}

export class CreateGroupEventDto {
  @ApiProperty({ description: "Group Event", example: "Group Event" })
  @IsString()
  summary: string;

  @ApiProperty({ description: "Group Event Description ", example: "Group Event Description" })
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

  @ApiProperty({ example: "EVENT" })
  @IsEventType()
  @IsOptional()
  type?: EVENT_TYPE;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiProperty({ example: "6ec60152-4548-4684-858d-bc54bce1983e" })
  @IsString()
  @IsNotEmpty()
  group_id: string;
}
