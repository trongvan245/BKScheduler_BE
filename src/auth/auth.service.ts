import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { AUTH_MESSAGES } from "src/common/constants";

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;
  constructor(
    // private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
    // private userService: UsersService,
  ) {
    console.log(config.get("GOOGLE_CLIENT_ID"), config.get("GOOGLE_CLIENT_SECRET"), config.get("GOOGLE_REDIRECT_URI"));
    this.oauth2Client = new OAuth2Client(
      config.get("GOOGLE_CLIENT_ID"),
      config.get("GOOGLE_CLIENT_SECRET"),
      config.get("GOOGLE_REDIRECT_URI"),
    );
  }

  
  async verifyUser(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      const options = {
        idToken: tokens.id_token,
        audience: this.config.get("GOOGLE_CLIENT_ID"),
      };

      const ticket = await this.oauth2Client.verifyIdToken(options);

      const { email, family_name, given_name, picture } = ticket.getPayload();
      return { email, family_name, given_name, picture };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
    }
  }
}
