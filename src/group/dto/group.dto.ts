import { IsDate, IsISO8601, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GroupDto {
  @ApiProperty({
    description: "The ID of the group owner",
    example: "d28f8f2f-550d-4997-9af9-cfcc0cec625d",
  })
  @IsNotEmpty()
  @IsString()
  ownerID: string;

  @ApiProperty({
    description: "The name of the group. If not provided, it defaults to 'Created by [ownerID] at [createTime]'.",
    example: "Created by Bui Trong Van",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty({
  //   description: "The time when the group is created",
  //   example: new Date(),
  // })
  // @IsISO8601()
  // @IsNotEmpty()
  // createTime: Date

  @ApiProperty({
    description: "A brief description of the group",
    example: "This is a developer's group.",
  })
  @IsString()
  description: string;

  // @ApiProperty({
  //   description: "The number of members in the group",
  //   example: 1,
  //   default: 1,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // numMember = 1;

  // constructor() {
  //   // Dynamically set the default value for `name` when `ownerID` and `createTime` are available.
  //   if (!this.name && this.ownerID && this.createTime) {
  //     this.name = `Created by ${this.ownerID} at ${this.createTime.toISOString()}`;
  //   }
  // }
}


export class AddUserToGroupDto {
  @ApiProperty({
    description: "The ID of the group",
    example: "6ec60152-4548-4684-858d-bc54bce1983e",
  })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty({
    description: "The ID of the user",
    example: "e9efd948-ba7c-4800-a5ad-992b1a743886",
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}