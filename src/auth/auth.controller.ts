import { Body, Controller, ForbiddenException, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetUser, Public } from "src/common/decorators";
import { AUTH_MESSAGES } from "src/common/constants";
import { GoogleAuthGuard } from "./guard";
import { JwtPayLoad } from "src/common/model";
import { googleOneTapDto, RefreshTokenDto } from "./dto";
import axios from "axios";

@ApiTags("authenticate")
@Controller("auth")
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "Ping" })
  @Public()
  @Get("ping")
  ping() {
    return { msg: "Hello World" };
  }
  @ApiOperation({ summary: "Pong(with authenticate)" })
  @Get("pong")
  pong() {
    return { msg: "You have login" };
  }

  @Public()
  @Get("login")
  @UseGuards(GoogleAuthGuard) //use this to handle redirection
  login() {
    return { msg: "ok" };
  }

  @Public()
  @Get("google")
  async googleOauth(@Query("code") code: string) {
    if (!code) {
      throw new ForbiddenException(AUTH_MESSAGES.AUTHORIZATION_CODE_REQUIRED);
    }

    const payload = await this.authService.verifyUser(code);

    return {
      ...payload,
    };
  }

  @Public()
  @Post("google/one-tap")
  async googleOneTap(@Body() { credential }: googleOneTapDto) {
    if (!credential) {
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_ONE_TAP_CODE);
    }

    const payload = await this.authService.verifyGoogleOneTap(credential);

    return {
      ...payload,
    };
  }

  @ApiOperation({ summary: "Renew Access Token" })
  @Public()
  @Post("refreshToken")
  async getAccessToken(@Body() { refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new ForbiddenException(AUTH_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const access_token = await this.authService.resignAccessToken(refreshToken);
    return {
      msg: "Success",
      access_token,
    };
  }
}
