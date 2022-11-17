import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator'

import { LessonHomework, LessonPresence } from '../lesson.schema'

export class LessonParticipantDto {
  @IsEnum(LessonHomework)
  homework: LessonHomework

  @IsEnum(LessonPresence)
  presence: LessonPresence

  @IsOptional()
  @IsString()
  note?: string

  @IsMongoId()
  student: string
}
