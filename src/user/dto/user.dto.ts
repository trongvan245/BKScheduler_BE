import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateMeDto {
  @ApiProperty({ example: "verifyjohndoe@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  verified_email: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  name: string;

  @ApiProperty({ example: "John" })
  @IsString()
  given_name: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  family_name: string;

  @ApiProperty({ example: "URL" })
  @IsString()
  picture: string;

  @ApiProperty()
  @IsString()
  hd: string;

  @ApiProperty()
  @IsString()
  isSync: boolean;


  @ApiProperty()
  @IsString()
  calendar_refresh_token: string;
}
