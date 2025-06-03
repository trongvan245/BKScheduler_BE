import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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

  async getGroupMembers(groupId: string) {
    const group = await this.prismaservice.group.findUnique({
      where: { id: groupId },
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
    if (!group) throw new NotFoundException(`The group with ID ${groupId} is not existed`);
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

    const notification = await this.prismaservice.notification.create({
      data: {
        title: `Thành viên mới: ${user.name}`,
        body: `${user.name} đã tham gia nhóm ${group.name}`,
        isRead: false,
        groupId: groupId,
      },
    });

    await this.prismaservice.group.update({
      where: {
        id: groupId,
      },
      data: {
        numMember: {
          increment: 1,
        },
      },
    });
    
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

  async chatbotGroupService(userId: string, action: string, data: any) {
    switch (action) {
      case "createGroup":
        if (!data || !data.name) {
          return { messageError: "Thiếu tên nhóm khi tạo nhóm." };
        }
        return this.createGroup(userId, data);
      case "findGroupById":
        if (!data || !data.groupId) {
          return { messageError: "Thiếu ID nhóm khi tìm nhóm theo ID." };
        }
        return this.findGroupById(data.groupId);
      case "addUserToGroup":
        if (!data || !data.email || !data.groupId) {
          return { messageError: "Thiếu email người dùng hoặc ID nhóm khi thêm người dùng vào nhóm." };
        }
        return this.addUserToGroup(data.email, data.groupId);
      case "removeUserFromGroup":
        if (!data || !data.email || !data.groupId) {
          return { messageError: "Thiếu email người dùng hoặc ID nhóm khi xóa người dùng khỏi nhóm." };
        }
        return this.removeUserFromGroup(data.email, data.groupId);
      case "findUserGroups":
        return this.findUserGroups(userId);
      case "listAllGroups":
        return this.getAllGroups();
      // case "listGroupMembers":
      //   if (!data || !data.groupId) {
      //     return { messageError: "Thiếu ID nhóm khi lấy danh sách thành viên." };
      //   }
      //   return this.listGroupMembers(data.groupId);
      // case "updateGroupInfo":
      //   if (!data || !data.groupId || !data.groupInfo) {
      //     return { messageError: "Thiếu ID nhóm hoặc thông tin cập nhật khi cập nhật thông tin nhóm." };
      //   }
      //   return this.updateGroupInfo(data.groupId, data.groupInfo, userId);
      // case "deleteGroup":
      //   if (!data || !data.groupId) {
      //     return { messageError: "Thiếu ID nhóm khi xóa nhóm." }
      //   }
      //   return this.deleteGroup(data.groupId, userId)
      default:
        return { messageError: "Hành động không hợp lệ." };
    }
  }

}
