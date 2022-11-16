import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common'

import { IsAdmin } from '../auth/decorators'
import { CreateGroupDto, UpdateGroupDto, AssignStudentDto } from './dtos'
import { GroupsService } from './groups.service'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @IsAdmin()
  @Post()
  createGroup(@Body() body: CreateGroupDto) {
    return this.groupsService.create(body.name)
  }

  @IsAdmin()
  @Put('/assignStudent')
  assignStudent(@Body() body: AssignStudentDto) {
    return this.groupsService.assignStudent(
      body.groupId,
      body.studentId,
      body.add
    )
  }

  @IsAdmin()
  @Delete('/:id')
  deleteGroup(@Param('id') id: string) {
    return this.groupsService.delete(id)
  }

  @IsAdmin()
  @Put('/:id')
  updateGroup(@Param('id') id: string, @Body() body: UpdateGroupDto) {
    return this.groupsService.update(id, body)
  }
}
