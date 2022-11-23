import {
  IsEnum,
  IsOptional,
  IsString,
  IsMongoId,
  MaxLength,
} from 'class-validator'

import {
  STRING_INVALID,
  STUDENT_ID_INVALID,
} from '../../utils/validation-errors'
import { LessonHomework, LessonPresence } from '../lesson.schema'

export class LessonParticipantDto {
  @IsEnum(LessonHomework, { message: 'Praca domowa niepoprawna' })
  homework: LessonHomework

  @IsEnum(LessonPresence, { message: 'Obecność niepoprawna' })
  presence: LessonPresence

  @IsOptional()
  @IsString({ message: STRING_INVALID })
  @MaxLength(1000, {
    message: 'Notatka może mieć maksymalnie $constraint1 znaków',
  })
  note?: string

  @IsMongoId({ message: STUDENT_ID_INVALID })
  student: string
}
