import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { GroupDto } from './dto';
import { Public } from 'src/common/decorators';

@ApiBearerAuth()
@Controller('group')
export class GroupController {
    constructor(private groupservice: GroupService) { }


    @ApiOperation({ summary: "Create a new group" })
    @Post('new')
    async createGroup(@Body() data: GroupDto) {
        return await this.groupservice.creatGroup(data);
    }

    @ApiOperation({ summary: "Add an user to a group" })
    @Post('add')
    async addUserToGroup(
        @Body('groupId') groupId: string,
        @Body('userId') userId: string,
    ) {
        return this.groupservice.addUserToGroup(userId, groupId);
    }

    @ApiOperation({ summary: "Remove an user from a group" })
    @Put('remove')
    async removeUserFromGroup(
        @Body('groupId') groupId: string,
        @Body('userId') userId: string,
    ) {
        return this.groupservice.removeUserFromGroup(userId, groupId);
    }

    @ApiOperation({ summary: "Find a specific group with its ID" })
    @Get(':id')
    async findGroupById(@Param('id') groupId: string) {
        return this.groupservice.findGroupById(groupId);
    }
}