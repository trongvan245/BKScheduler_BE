import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMeDto } from "./dto";
import { Users } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  omitRefreshToken(user: Users) {
    const { refresh_token, ...rest } = user;
    return rest;
  }

  async isUserExist(id: string) {
    if (await this.prisma.users.findUnique({ where: { id } })) {
      return true;
    }

    throw new NotFoundException("User not found");
  }

  async getUser(id: string) {
    await this.isUserExist(id);
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    delete user.refresh_token;
    return this.omitRefreshToken(user);
  }

  async updateMe(id: string, { verified_email, name, given_name, family_name, picture, hd, isSync }: UpdateMeDto) {
    await this.isUserExist(id);

    const updateData = {
      email_verified: verified_email ?? undefined,
      name: name ?? undefined,
      given_name: given_name ?? undefined,
      family_name: family_name ?? undefined,
      picture: picture ?? undefined,
      hd: hd ?? undefined,
      isSync: isSync ?? undefined,
    };
    const user = await this.prisma.users.update({
      where: { id },
      data: updateData,
    });

    return this.omitRefreshToken(user);
  }
}
