import { IsOptional, IsString, IsBoolean, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiPropertyOptional({ description: "Notification title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "Notification body" })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: "Is notification read", default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: "Group ID" })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
