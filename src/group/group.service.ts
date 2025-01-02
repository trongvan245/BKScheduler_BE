import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GroupDto } from "./dto";

@Injectable()
export class GroupService {
  constructor(private prismaservice: PrismaService) {}

  async createGroup(dto: GroupDto) {
    const user = await this.prismaservice.user.findUnique({
      where: {
        id: dto.ownerID,
      },
    });

    if (!user) throw new NotFoundException(`The user ${dto.ownerID} is not existed`);

    const group = await this.prismaservice.group.create({
      data: {
        ownerId: dto.ownerID,
        name: dto.name,
        description: dto.description,
        numMember: dto.numMember,
        createTime: dto.createTime,
        userGroups: {
          create: {
            User: {
              connect: {
                id: dto.ownerID,
              },
            },
          },
        },
      },
    });

    if (!group) throw new ForbiddenException("Cannot create the group");

    return group;
  }

  async findGroupById(id: string) {
    const group = await this.prismaservice.group.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!group) throw new NotFoundException("The group is not existed");

    return group;
  }

  async addUserToGroup(userId: string, groupId: string) {
    const user = await this.prismaservice.user.findUnique({
      where: {
        id: userId,
      },
    });
    const group = await this.prismaservice.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!user) throw new NotFoundException(`The user ${userId} is not existed`);
    if (!group) throw new NotFoundException(`The group ${groupId} is not existed`);

    const userGroup = await this.prismaservice.userGroup.findUnique({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: groupId,
        },
      },
    });

    if (userGroup) throw new ForbiddenException(`The user ${userId} is existed in the group ${groupId}`);

    const newUserGroup = await this.prismaservice.userGroup.create({
      data: {
        Group: {
          connect: {
            id: groupId,
          },
        },
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });

    if (!newUserGroup) throw new ForbiddenException(`Cannot add the user ${userId} to the group ${groupId}`);

    return newUserGroup;
  }

  async removeUserFromGroup(userId: string, groupId: string) {
    const userGroup = await this.prismaservice.userGroup.findUnique({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: groupId,
        },
      },
    });

    if (!userGroup) throw new ForbiddenException(`The user ${userId} doesn't join in the group ${groupId}`);

    await this.prismaservice.userGroup.delete({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: groupId,
        },
      },
    });

    return userGroup;
  }

  async findUserGroups(userId: string) {
    return await this.prismaservice.userGroup.findMany({
      where: {
        user_id: userId,
      },
      select: {
        Group: true,
      },
    });
  }

  async getAllGroups() {
    return await this.prismaservice.group.findMany();
  }
}
