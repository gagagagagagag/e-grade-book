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

import { CurrentUser, IsAuthenticated, IsTeacher } from '../auth/decorators'
import { PaginationOptions } from '../decorators'
import { PaginationOptionsDto } from '../dtos'
import { User } from '../users/schemas'
import { CreateLessonDto, UpdateLessonDto } from './dtos'
import { LessonsService } from './lessons.service'

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @IsAuthenticated()
  @Get()
  getLessons(
    @PaginationOptions() paginationOptions: PaginationOptionsDto,
    @CurrentUser() currentUser: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('teacher') teacher?: string,
    @Query('group') group?: string,
    @Query('student') student?: string
  ) {
    return this.lessonsService.getLessons(paginationOptions, currentUser, {
      from,
      to,
      teacher,
      group,
      student,
    })
  }

  @IsTeacher(false)
  @Post()
  createLesson(
    @CurrentUser() currentUser: User,
    @Body() body: CreateLessonDto
  ) {
    return this.lessonsService.create(currentUser.id, body)
  }

  @IsTeacher()
  @Put('/:id')
  updateLesson(
    @Param('id') id: string,
    @Body() body: UpdateLessonDto,
    @CurrentUser() currentUser: User
  ) {
    return this.lessonsService.update(id, body, currentUser)
  }

  @IsTeacher()
  @Delete('/:id')
  deleteLesson(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.lessonsService.delete(id, currentUser)
  }

  @IsTeacher()
  @Get('/exportLessons')
  exportLessons() {}
}
