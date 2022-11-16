import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'

import { IsAdmin, IsAuthenticated, UserRole } from '../auth/decorators'
import { PaginationOptions } from '../decorators'
import { PaginationOptionsDto } from '../dtos'
import { AssignStudentDto } from './dtos'
import { UserRoles } from './schemas'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @IsAuthenticated()
  @Get('/:id')
  getUser(@Param('id') id: string, @UserRole() role: UserRoles) {
    return this.usersService.getUser(id, role)
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
  @Put('/assignStudent')
  assignStudent(@Body() body: AssignStudentDto) {
    return this.usersService.assignStudent(
      body.targetId,
      body.studentId,
      body.add
    )
  }
}
