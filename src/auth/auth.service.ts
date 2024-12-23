import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
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
      // config.get("GOOGLE_REDIRECT_URI"),
    );
  }

  async verifyGoogleOneTap(credential: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: credential,
        audience: this.config.get("GOOGLE_CLIENT_ID"),
      });
      const payload = ticket.getPayload();
      const { email, family_name, given_name, picture, hd, name, email_verified } = payload;
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(email),
        this.signRefreshToken(email),
      ]);
      return {
        access_token,
        refresh_token,
        email,
        family_name,
        given_name,
        verified_email: email_verified,
        name,
        picture,
        hd,
      };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
    }
  }
  async verifyUser(code: string) {
    try {
      const response = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${code}`,
        },
      });

      const { email, family_name, given_name, picture, hd, name, email_verified } = response.data;

      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(email),
        this.signRefreshToken(email),
      ]);
      return {
        access_token,
        refresh_token,
        email,
        verified_email: email_verified,
        name,
        family_name,
        given_name,
        picture,
        hd,
      };
    } catch (error) {
      // console.log(error);
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
    }
  }
  // async verifyUser(code: string) {
  //   try {
  //     const { tokens } = await this.oauth2Client.getToken(code);

  //     const options = {
  //       idToken: tokens.id_token,
  //       audience: this.config.get("GOOGLE_CLIENT_ID"),
  //     };

  //     const ticket = await this.oauth2Client.verifyIdToken(options);

  //     const { email, family_name, given_name, picture, hd, name, email_verified } = ticket.getPayload();
  //     return { email, family_name, given_name, picture, hd, name, email_verified };
  //   } catch (error) {
  //     console.log(error);
  //     throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
  //   }
  // }

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
