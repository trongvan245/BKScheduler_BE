import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GroupDto {
  @ApiProperty({
    description: "The ID of the group owner",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsString()
  ownerID: string;

  @ApiProperty({
    description: "The name of the group. If not provided, it defaults to 'Created by [ownerID] at [createTime]'.",
    example: "Created by 123e4567-e89b-12d3-a456-426614174000 at 2023-07-15T10:00:00Z",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "The time when the group is created",
    example: "2023-07-15T10:00:00Z",
  })
  @IsDate()
  @IsNotEmpty()
  createTime = new Date();

  @ApiProperty({
    description: "A brief description of the group",
    example: "This is a developer's group.",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "The number of members in the group",
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  numMember = 1;

  constructor() {
    // Dynamically set the default value for `name` when `ownerID` and `createTime` are available.
    if (!this.name && this.ownerID && this.createTime) {
      this.name = `Created by ${this.ownerID} at ${this.createTime.toISOString()}`;
    }
  }
}
