import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class getAllGroupEventsDto {
  @ApiProperty({ description: "group_id", example: "b4b52058-da82-4e40-b0ea-f672b59a3f1d" })
  @IsString()
  @IsNotEmpty()
  group_id: string;
}
