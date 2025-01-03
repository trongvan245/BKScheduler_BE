import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GroupDto } from "./dto";

@Injectable()
export class GroupService {
  constructor(private prismaservice: PrismaService) {}

  async createGroup(userId: string, dto: GroupDto) {
    const user = await this.prismaservice.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException(`The user ${userId} is not existed`);

    const group = await this.prismaservice.group.create({
      data: {
        ownerId: userId,
        name: dto.name,
        description: dto.description,
        numMember: 1,
        // createTime: dto.createTime,
        userGroups: {
          create: {
            User: {
              connect: {
                id: userId,
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
        userGroups: {
          select: {
            User: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundException("The group is not existed");
    const users = group.userGroups.map((userGroup) => userGroup.User);
    const flattenedGroup = {
      ...group,
      users,
    };
    delete flattenedGroup.userGroups;
    return flattenedGroup;
  }

  async addUserToGroup(email: string, groupId: string) {
    const user = await this.prismaservice.user.findUnique({
      where: {
        email,
      },
    });
    const group = await this.prismaservice.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!user) throw new NotFoundException(`The email ${email} is not existed`);
    if (!group) throw new NotFoundException(`The group ${groupId} is not existed`);

    const userGroup = await this.prismaservice.userGroup.findUnique({
      where: {
        user_id_group_id: {
          user_id: user.id,
          group_id: groupId,
        },
      },
    });

    if (userGroup) throw new ForbiddenException(`The user ${user.name} is existed in the group ${groupId}`);

    const newUserGroup = await this.prismaservice.userGroup.create({
      data: {
        Group: {
          connect: {
            id: groupId,
          },
        },
        User: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (!newUserGroup) throw new ForbiddenException(`Cannot add the user ${user.name} to the group ${groupId}`);

    return user;
  }

  async removeUserFromGroup(email: string, groupId: string) {
    const user = await this.prismaservice.user.findUnique({
      where: {
        email,
      },
    });
    const group = await this.prismaservice.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!user) throw new NotFoundException(`The email ${email} is not existed`);
    if (!group) throw new NotFoundException(`The group ${groupId} is not existed`);

    const userGroup = await this.prismaservice.userGroup.findUnique({
      where: {
        user_id_group_id: {
          user_id: user.id,
          group_id: groupId,
        },
      },
    });

    if (!userGroup) throw new ForbiddenException(`The user ${user.name} doesn't join in the group ${groupId}`);

    await this.prismaservice.userGroup.delete({
      where: {
        user_id_group_id: {
          user_id: user.id,
          group_id: groupId,
        },
      },
    });

    return user;
  }

  async findUserGroups(userId: string) {
    const groups = await this.prismaservice.userGroup.findMany({
      where: {
        user_id: userId,
      },
      select: {
        Group: true,
      },
    });

    const filtedGroups = groups.map((group) => group.Group);

    return filtedGroups;
  }

  async getAllGroups() {
    return await this.prismaservice.group.findMany();
  }
}
