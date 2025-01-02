import { ApiProperty } from "@nestjs/swagger";

export class EventDto {
  @ApiProperty({ example: "id" })
  id: string;

  @ApiProperty({ example: "summary" })
  summary: string;

  @ApiProperty({ example: "description" })
  description: string;

  @ApiProperty({ example: "isComplete" })
  isComplete: boolean;

  @ApiProperty({ example: "type" })
  type: string;

  @ApiProperty({ example: 1 })
  priority: number;

  @ApiProperty({ example: "createdTime" })
  createdTime: string;

  @ApiProperty({ example: "startTime" })
  startTime: string;

  @ApiProperty({ example: "endTime" })
  endTime: string;

  @ApiProperty({ example: "group_id" })
  group_id: string | null;
}
export class GetMeOkResponseDto {
  @ApiProperty({ type: [EventDto] })
  events: EventDto[];
}
