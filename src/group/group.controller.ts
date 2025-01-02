import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AddUserToGroupDto, GroupDto } from "./dto";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";

@ApiBearerAuth()
@ApiTags("group")
@Controller("group")
export class GroupController {
  constructor(private groupservice: GroupService) {}

  @ApiOperation({ summary: "Create a new group" })
  @Post("new")
  async createGroup(@Body() data: GroupDto) {
    return await this.groupservice.createGroup(data);
  }

  @ApiOperation({ summary: "Add an user to a group" })
  @Post("add")
  async addUserToGroup(@Body() { groupId, userId }: AddUserToGroupDto) {
    return this.groupservice.addUserToGroup(userId, groupId);
  }

  @ApiOperation({ summary: "Remove an user from a group" })
  @Put("remove")
  async removeUserFromGroup(@Body("groupId") groupId: string, @Body("userId") userId: string) {
    return this.groupservice.removeUserFromGroup(userId, groupId);
  }

  @ApiOperation({ summary: "Get all groups of user" })
  @Get("mygroups")
  async findUserGroups(@GetUser() { sub }: JwtPayLoad) {
    const groups = await this.groupservice.findUserGroups(sub);
    return { groups };
  }
  

  @ApiOperation({ summary: "Get a specific group with its ID(not necessary to be user's group)" })
  @Get(":id")
  async findGroupById(@Param("id") groupId: string) {
    return this.groupservice.findGroupById(groupId);
  }

  @ApiOperation({ summary: "Get all groups(just for development)" })
  @Get()
  async getAllGroups() {
    return this.groupservice.getAllGroups();
  }
}
