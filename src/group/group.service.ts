import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupDto } from './dto';

@Injectable()
export class GroupService {
    constructor(private prismaservice: PrismaService) {}

    async creatGroup(dto: GroupDto) {
        const group = await this.prismaservice.group.create({
            data: {
                ownerId: dto.ownerID,
                name: dto.name,
                description: dto.description,
                numMember: dto.numMember,
                createTime: dto.createTime,
            }
        });

        if (!group) throw new ForbiddenException('Cannot create the group');

        return group;
    }

    async findGroupById(id: string) {
        return await this.prismaservice.group.findUnique({
            where: { id: id }
        });
    }

    async addUserToGroup(userId: string, groupId: string) {
        const userGroup = await this.prismaservice.userGroup.findUnique({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId,
                }
            }
        });

        if (userGroup) throw new ForbiddenException(`The user ${userId} is existed in the group ${groupId}`);

        const newUserGroup = await this.prismaservice.userGroup.create({
            data: {
                Group: {
                    connect: {
                        id: groupId,
                    }
                },
                User: {
                    connect: {
                        id: userId,
                    }
                }
            }
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
                }
            }
        });

        if (!userGroup) throw new ForbiddenException(`The user ${userId} doesn't join in the group ${groupId}`);

        await this.prismaservice.userGroup.delete({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId,
                }
            }
        });

        return userGroup;
    }

    async findUserGroups(userId: string) {
        return await this.prismaservice.userGroup.findMany({
            where: {
                user_id: userId,
            },
            select:{
                Group: true,
            }
        });
    }

    async getAllGroups() {
        return await this.prismaservice.group.findMany();
    }
}