import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { CurrentUser, IsTeacher } from '../auth/decorators'
import { User } from '../users/schemas'
import { CreateLessonDto, UpdateLessonDto } from './dtos'
import { LessonsService } from './lessons.service'

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  getLessons() {}

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
