import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AddUserToGroupDto, GroupDto } from "./dto";
import { GetUser, Public } from "src/common/decorators";
import { JwtPayLoad } from "src/common/model";

@ApiBearerAuth()
@ApiTags("Group")
@Controller("group")
export class GroupController {
  constructor(private groupservice: GroupService) {}

  @ApiOperation({ summary: "Create a new group" })
  @Post("")
  async createGroup(@GetUser() { sub }: JwtPayLoad, @Body() data: GroupDto) {
    return await this.groupservice.createGroup(sub, data);
  }

  @ApiOperation({ summary: "Add a user to a group" })
  @ApiParam({ 
    name: 'groupId', 
    description: 'The ID of the group to add the user to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String 
  })
  @ApiBody({ 
    type: AddUserToGroupDto,
    description: 'Email of the user to be added to the group'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully added to the group' 
  })
  @Post(":groupId/members")
  async addUserToGroup(
    @Param("groupId") groupId: string,
    @Body() {email}: AddUserToGroupDto
  ) {
    const res = await this.groupservice.addUserToGroup(email, groupId);
    return res;
  }
  
  @ApiOperation({ summary: "Remove a user from a group" })
  @ApiParam({ 
    name: 'groupId', 
    description: 'The ID of the group to remove the user from',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String 
  })
  @ApiParam({ 
    name: 'email', 
    description: 'Email of the user to be removed from the group',
    example: 'user@hcmut.edu.vn',
    type: String 
  })
  @Delete(":groupId/members/:email")
  async removeUserFromGroup(
    @Param("groupId") groupId: string,
    @Param("email") email: string
  ) {
    const res = await this.groupservice.removeUserFromGroup(email, groupId);
    return res;
  }

  @ApiOperation({ summary: "Get all groups of user" })
  @Get("")
  async findUserGroups(@GetUser() { sub }: JwtPayLoad) {
    const groups = await this.groupservice.findUserGroups(sub);
    return { groups };
  }

  @ApiOperation({ summary: "Get all groups(just for development)" })
  @Get("dev")
  async getAllGroups() {
    const res = await this.groupservice.getAllGroups();
    console.log("Get all groups: ", res);
    return res
  }

  @ApiOperation({ summary: "Get a specific group with its ID(not necessary to be user's group)" })
  @Get(":id")
  async findGroupById(@Param("id") groupId: string) {
    return await this.groupservice.findGroupById(groupId);
  }
}
