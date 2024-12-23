import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: string) {
    const user = this.prisma.users.findUnique({
      where: { id },
    });
    delete (await user).refresh_token;
  }
}
