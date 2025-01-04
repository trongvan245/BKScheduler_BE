import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { access } from "fs";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {
    super({
      clientID: config.get("GOOGLE_CLIENT_ID"),
      clientSecret: config.get("GOOGLE_CLIENT_SECRET"),
      callbackURL: config.get("GOOGLE_REDIRECT_URI"),
      scope: ["email", "profile", "https://www.googleapis.com/auth/calendar"],
      accessType: "offline",
      prompt: "consent",
      hd: "hcmut.edu.vn",
    });
  }

  authorizationParams(options: any): any {
    return {
      ...options,
      access_type: "offline",
      prompt: "consent",
      hd: "hcmut.edu.vn",
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);
    // const user = await this.authService.validateUser(
    //   profile.emails[0].value,
    //   profile.displayName,
    // );
    // return user || null;
    return null;
  }
}
