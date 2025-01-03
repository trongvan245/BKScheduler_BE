import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { AUTH_MESSAGES } from "src/common/constants";
import { JwtPayLoad } from "src/common/model";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {
    this.oauth2Client = new OAuth2Client(
      config.get("GOOGLE_CLIENT_ID"),
      config.get("GOOGLE_CLIENT_SECRET"),
      config.get("GOOGLE_REDIRECT_URI"),
    );
  }

  async isEmailExist(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async addUser(payload: TokenPayload, calendar_refresh_token: string) {
    const { email, family_name, given_name, picture, hd, name, email_verified } = payload;

    const user = await this.isEmailExist(email);

    if (user) {
      await this.prisma.user.update({ where: { id: user.id }, data: { calendar_refresh_token } });
      return user;
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        family_name,
        given_name,
        picture,
        hd,
        name,
        verified_email: email_verified,
        indiGroup: {
          create: {
            name: "IndiGroup",
            numMember: 1,
            ownerId: undefined, // Placeholder to be updated after user creation
          },
        },
        calendar_refresh_token,
      },
    });

    await this.prisma.group.update({
      where: { id: newUser.indiGroupId },
      data: { ownerId: newUser.id },
    });

    return newUser;
  }

  // async verifyGoogleOneTap(credential: string) {
  //   try {
  //     const ticket = await this.oauth2Client.verifyIdToken({
  //       idToken: credential,
  //       audience: this.config.get("GOOGLE_CLIENT_ID"),
  //     });
  //     const payload = ticket.getPayload();
  //     const user = await this.addUser(payload);

  //     const [access_token, refresh_token] = await Promise.all([
  //       this.signAccessToken(payload.email),
  //       this.signRefreshToken(payload.email),
  //     ]);

  //     return {
  //       ...user,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
  //   }
  // }
  // async verifyGoogleOauth(code: string) {
  //   try {
  //     const response = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
  //       headers: {
  //         Authorization: `Bearer ${code}`,
  //       },
  //     });

  //     const payload = response.data; //fuck this i cant use typescript properly

  //     const [access_token, refresh_token] = await Promise.all([
  //       this.signAccessToken(payload.email),
  //       this.signRefreshToken(payload.email),
  //     ]);

  //     const user = await this.addUser(payload);

  //     return {
  //       ...user,
  //     };
  //   } catch (error) {
  //     throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
  //   }
  // }
  async verifyGoogleOauth(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      const options = {
        idToken: tokens.id_token,
        audience: this.config.get("GOOGLE_CLIENT_ID"),
      };

      const ticket = await this.oauth2Client.verifyIdToken(options);
      const calendar_refresh_token = tokens.refresh_token;

      if (!calendar_refresh_token) throw new BadRequestException("No calendar refresh token");

      const payload = ticket.getPayload();
      const { email, family_name, given_name, picture, hd, name, email_verified } = payload;

      const user = await this.addUser(payload, calendar_refresh_token);
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user.id, payload.email),
        this.signRefreshToken(user.id, payload.email),
      ]);
      return { email, family_name, given_name, picture, hd, name, email_verified, access_token, refresh_token };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_CODE);
    }
  }

  async signRefreshToken(userId, email: string) {
    const tokenPayload = {
      sub: userId,
      email,
    } as JwtPayLoad;

    const refresh_token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.config.get<string>("REFRESH_TOKEN_SECRET"),
      expiresIn: "1h",
    });

    const res = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        refresh_token,
      },
    });

    return refresh_token;
  }
  async signAccessToken(userId, email: string) {
    const tokenPayload = {
      sub: userId,
      email,
    } as JwtPayLoad;

    const access_token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.config.get<string>("ACCESS_TOKEN_SECRET"),
      expiresIn: "15m",
    });

    return access_token;
  }

  async resignAccessToken(refresh_token: string) {
    try {
      const payload = (await this.jwtService.verifyAsync(refresh_token, {
        secret: this.config.get<string>("REFRESH_TOKEN_SECRET"),
      })) as JwtPayLoad;

      return this.signAccessToken(payload.sub, payload.email);
    } catch (error) {
      throw new ForbiddenException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async getUserInfo(sub: string) {
    return this.prisma.user.findUnique({
      where: {
        id: sub,
      },
    });
  }
}
