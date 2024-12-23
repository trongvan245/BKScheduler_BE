import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { UpdateMeDto } from "./dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  async getMe(@GetUser() { sub }: JwtPayLoad) {
    const user = await this.userService.getUser(sub);
    return user;
  }

  async updateMe(@GetUser() { sub }: JwtPayLoad, data: UpdateMeDto) {
    const updatedUser = await this.userService.updateMe(sub, data);
    return updatedUser;
  }
}
