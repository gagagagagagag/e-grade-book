import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { GroupsModule } from '../groups/groups.module'
import { UsersModule } from '../users/users.module'
import { LessonsService } from './lessons.service'
import { LessonsController } from './lessons.controller'
import { Lesson, LessonSchema } from './lesson.schema'

@Module({
  exports: [LessonsService],
  providers: [LessonsService],
  controllers: [LessonsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Lesson.name,
        schema: LessonSchema,
      },
    ]),
    UsersModule,
    GroupsModule,
  ],
})
export class LessonsModule {}
