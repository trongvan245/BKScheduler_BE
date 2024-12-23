import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  async getMe(@GetUser() { sub, email }: JwtPayLoad) {
    const user = await this.userService.getUser(sub);

    
  }
}
