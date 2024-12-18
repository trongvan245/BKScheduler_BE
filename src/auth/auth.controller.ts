import { Controller, ForbiddenException, Get, Query, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators";
import { AUTH_MESSAGES } from "src/common/constants";
import { GoogleAuthGuard } from "./guard";

@ApiTags("authenticate")
@Controller("auth")
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "Ping" })
  @Get("ping")
  ping() {
    return { msg: "Hello World" };
  }

  @Get("google/login")
  @UseGuards(GoogleAuthGuard) //use this to handle redirection
  login() {
    return { msg: "ok" };
  }

  @Get("google/redirect")
  async redirect(@Query("code") code: string) {
    if (!code) {
      throw new ForbiddenException(AUTH_MESSAGES.AUTHORIZATION_CODE_REQUIRED);
    }
    console.log(code);
    const { email, family_name, given_name, picture } = await this.authService.verifyUser(code); //This might be helpful

    // const user = await this.authService.validateUser(email, family_name, given_name, picture);

    // const token = await this.authService.signToken(user);

    return {
      msg: "Success",
      data: {
        email,
        family_name,
        given_name,
        picture,
        // token,
        // user,
      },
    };
  }
}
