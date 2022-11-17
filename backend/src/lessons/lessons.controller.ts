import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common'

import { CurrentUser, IsAdmin, IsTeacher } from '../auth/decorators'
import { User } from '../users/schemas'
import { CreateLessonDto } from './dtos'
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
  @Put()
  updateLesson() {}

  @IsAdmin()
  @Delete()
  deleteLesson() {}

  @IsTeacher()
  @Get('/exportLessons')
  exportLessons() {}
}
