import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayLoad } from "src/common/model";
// import { JwtPayLoad } from 'src/common/model/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("access_token_secret"),
    });
  }

  validate(payload: JwtPayLoad) {
    // console.log(payload);
    return payload;
  }
}
