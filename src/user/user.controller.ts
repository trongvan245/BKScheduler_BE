import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";
import { UpdateMeDto } from "./dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  async getMe(@GetUser() { sub }: JwtPayLoad) {
    const user = await this.userService.getUser(sub);
    return user;
  }

  @Put("me/update")
  async updateMe(@GetUser() { sub }: JwtPayLoad, data: UpdateMeDto) {
    const updatedUser = await this.userService.updateMe(sub, data);
    return updatedUser;
  }

  @Public()
  @Post("add-token")
  async addRefreshToken(@Body() data: { refresh_token: string; userId: string }) {
    console.log("User::AddRefreshToken -> userId", data.userId);
    const updatedUser = await this.userService.addRefreshToken(data.userId, data.refresh_token);
    return updatedUser;
  }
}
