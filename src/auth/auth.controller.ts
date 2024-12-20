import { Body, Controller, ForbiddenException, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetUser, Public } from "src/common/decorators";
import { AUTH_MESSAGES } from "src/common/constants";
import { GoogleAuthGuard } from "./guard";
import { JwtPayLoad } from "src/common/model";
import { RefreshTokenDto } from "./dto";

@ApiTags("authenticate")
@Controller("auth")
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
  @Get("google/login")
  @UseGuards(GoogleAuthGuard) //use this to handle redirection
  login() {
    return { msg: "ok" };
  }

  @Public()
  @Get("google/redirect")
  async redirect(@Query("code") code: string) {
    if (!code) {
      throw new ForbiddenException(AUTH_MESSAGES.AUTHORIZATION_CODE_REQUIRED);
    }
    const { email, family_name, given_name, picture } = await this.authService.verifyUser(code); //This might be helpful

    // const user = await this.authService.validateUser(email, family_name, given_name, picture);

    const [access_token, refresh_token] = await Promise.all([
      this.authService.signAccessToken(email),
      this.authService.signRefreshToken(email),
    ]);

    return {
      msg: "Success",
      data: {
        email,
        family_name,
        given_name,
        picture,
        access_token,
        refresh_token,
        // token,
        // user,
      },
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
