import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMeDto } from "./dto";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  omitRefreshToken(user: User) {
    const { refresh_token, ...rest } = user;
    return rest;
  }

  async isUserExist(id: string) {
    if (await this.prisma.user.findUnique({ where: { id } })) {
      return true;
    }

    throw new NotFoundException("User not found");
  }

  async getUser(id: string) {
    await this.isUserExist(id);
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    delete user.refresh_token;
    return this.omitRefreshToken(user);
  }

  async addRefreshToken(id: string, refreshToken: string) {
    await this.isUserExist(id);
    if(!refreshToken) {
      throw new NotFoundException("Refresh token is required");
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        calendar_refresh_token: refreshToken,
      },
    });
    return this.omitRefreshToken(user);
  }

  async updateMe(
    id: string,
    { verified_email, name, given_name, family_name, picture, hd, isSync, calendar_refresh_token }: UpdateMeDto,
  ) {
    await this.isUserExist(id);

    const updateData = {
      email_verified: verified_email ?? undefined,
      name: name ?? undefined,
      given_name: given_name ?? undefined,
      family_name: family_name ?? undefined,
      picture: picture ?? undefined,
      hd: hd ?? undefined,
      isSync: isSync ?? undefined,
      calendar_refresh_token: calendar_refresh_token ?? undefined,
    };
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.omitRefreshToken(user);
  }
}
