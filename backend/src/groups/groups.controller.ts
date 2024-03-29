import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'

import { CurrentUser, IsAdmin, IsTeacher } from '../auth/decorators'
import { PaginationOptions } from '../decorators'
import { PaginationOptionsDto } from '../dtos'
import { TeacherUser, User } from '../users/schemas'
import { CreateGroupDto, UpdateGroupDto, AssignStudentDto } from './dtos'
import { GroupsService } from './groups.service'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @IsAdmin()
  @Get('/all')
  getAllGroups(
    @Query('notContainingStudents') notContainingStudents?: string[],
    @Query('notAssignedToTeacher') notAssignedToTeacher?: string
  ) {
    return this.groupsService.getAllGroups({
      notContainingStudents,
      notAssignedToTeacher,
    })
  }

  @IsTeacher()
  @Get('/my')
  getMyGroups(@CurrentUser() currentUser: TeacherUser) {
    return this.groupsService.getMyGroups(currentUser)
  }

  @IsTeacher()
  @Get('/:id')
  getGroup(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.groupsService.getGroup(id, currentUser)
  }

  @IsAdmin()
  @Get()
  getGroups(@PaginationOptions() paginationOptions: PaginationOptionsDto) {
    return this.groupsService.getGroups(paginationOptions)
  }

  @IsAdmin()
  @Post()
  createGroup(@Body() body: CreateGroupDto) {
    return this.groupsService.create(body)
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
