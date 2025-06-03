import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  // @ApiProperty({ example: "admin@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  // @ApiProperty({ example: "123456" })
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


export class GoogleMobileLoginDto {
  @ApiProperty({
    description: "The authorization code returned by Google",
    example: "4/0AfJohXnbla_zWsDhCMp-qGKUoYZJp7..."
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: "The code verifier used in the PKCE flow",
    example: "rQw8j3DQIGNJUAWTXlrh4a9IgDlrRJTc5a6FMDu_"
  })
  @IsString()
  @IsNotEmpty()
  code_verifier: string;

  @ApiProperty({
    description: "The redirect URI used in the authorization request",
    example: "com.myapp://oauth2redirect"
  })
  @IsString()
  @IsNotEmpty()
  redirect_uri: string;
}