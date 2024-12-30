// import { IsString, IsOptional, IsDate, IsBoolean, IsInt } from "class-validator";
// import { Transform } from "class-transformer";
// import { ApiProperty } from "@nestjs/swagger";

// export class CreateEventDto {
//   @ApiProperty({ description: "Event summary", example: "Event Summary" })
//   @IsString()
//   summary: string;

//   @ApiProperty({ description: "Event Description ", example: "Event Description" })
//   @IsString()
//   @IsOptional()
//   description?: string;

//   @ApiProperty({ example: "2021-09-01T00:00:00.000Z" })
//   @IsDate()
//   @IsOptional()
//   @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
//   startTime?: Date;

//   @ApiProperty({ example: "2021-09-01T00:00:00.000Z" })
//   @IsDate()
//   @IsOptional()
//   @Transform(({ value }) => (value ? new Date(value) : null), { toClassOnly: true })
//   endTime?: Date;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   @IsOptional()
//   isComplete?: boolean;

//   @ApiProperty({ example: "event_type" })
//   @IsString()
//   @IsOptional()
//   type?: string;

//   @ApiProperty({ example: 1 })
//   @IsInt()
//   @IsOptional()
//   priority?: number;

//   @ApiProperty({ example: "b4b52058-da82-4e40-b0ea-f672b59a3f1d" })
//   @IsString()
//   @IsOptional()
//   group_id?: string;
// }
