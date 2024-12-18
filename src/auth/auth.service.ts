import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { AUTH_MESSAGES } from "src/common/constants";
import { JwtPayLoad } from "src/common/model";

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;
  constructor(
    // private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {
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

  async signRefreshToken(email: string) {
    const tokenPayload = {
      sub: "1",
      email,
    } as JwtPayLoad;

    return this.jwtService.signAsync(tokenPayload, {
      secret: this.config.get<string>("refresh_token_secret"),
      expiresIn: "1h",
    });
  }
  async signAccessToken(email: string) {
    const tokenPayload = {
      sub: "1",
      email,
    } as JwtPayLoad;

    return this.jwtService.signAsync(tokenPayload, {
      secret: this.config.get<string>("access_token_secret"),
      expiresIn: "15m",
    });
  }

  async resignAccessToken(refresh_token: string) {
    try {
      const payload = (await this.jwtService.verifyAsync(refresh_token, {
        secret: this.config.get<string>("refresh_token_secret"),
      })) as JwtPayLoad;

      return this.signAccessToken(payload.email);
    } catch (error) {
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }
}
