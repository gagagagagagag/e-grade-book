import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'

import { IsAdmin, IsAuthenticated, CurrentUser } from '../auth/decorators'
import { PaginationOptions } from '../decorators'
import { PaginationOptionsDto } from '../dtos'
import { AssignStudentDto, AssignGroupDto, UpdateUserDto } from './dtos'
import { User, UserRoles } from './schemas'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @IsAdmin()
  @Get('/all/:role')
  getAllUsers(
    @Param('role') role: UserRoles,
    @Query('notContainingStudents') notContainingStudents?: string[],
    @Query('notContainingGroups') notContainingGroups?: string[],
    @Query('notAssignedToTeacher') notAssignedToTeacher?: string,
    @Query('notAssignedToParent') notAssignedToParent?: string
  ) {
    return this.usersService.getAllUsers(role, {
      notContainingStudents,
      notContainingGroups,
      notAssignedToTeacher,
      notAssignedToParent,
    })
  }

  @SkipThrottle()
  @IsAuthenticated()
  @Get('/:id')
  getUser(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.usersService.getUser(id, currentUser)
  }

  @IsAdmin()
  @Get('/')
  getUsers(
    @PaginationOptions() paginationOptions: PaginationOptionsDto,
    @Query('role') role?: UserRoles
  ) {
    return this.usersService.getUsers(paginationOptions, { role })
  }

  @IsAdmin()
  @Put('/assignGroup')
  assignGroup(@Body() body: AssignGroupDto) {
    return this.usersService.assignGroup(body.teacherId, body.groupId, body.add)
  }

  @IsAdmin()
  @Put('/assignStudent')
  assignStudent(@Body() body: AssignStudentDto) {
    return this.usersService.assignStudent(
      body.targetId,
      body.studentId,
      body.add
    )
  }

  @IsAdmin()
  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body)
  }
}
