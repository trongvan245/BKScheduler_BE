import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  @ApiProperty({ example: "admin@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "123456" })
  password: string;
}
export class googleOneTapDto {
  @ApiProperty({ example: "your_credential" })
  @IsString()
  @IsNotEmpty()
  credential: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: "your_refresh_token" })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
