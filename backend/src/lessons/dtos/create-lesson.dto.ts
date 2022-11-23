import { Type } from 'class-transformer'
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ArrayMinSize,
  IsDateString,
  ValidateNested,
} from 'class-validator'

import {
  GROUP_ID_INVALID,
  STUDENT_ID_INVALID,
  DATE_INVALID,
  NUMBER_INVALID,
  LESSON_DURATION_TOO_LONG,
  LESSON_DURATION_TOO_SHORT,
} from '../../utils/validation-errors'
import { LessonParticipantDto } from './lesson-participant.dto'

export class CreateLessonDto {
  @IsOptional()
  @IsMongoId({ message: STUDENT_ID_INVALID })
  student?: string

  @IsOptional()
  @IsMongoId({ message: GROUP_ID_INVALID })
  group?: string

  @IsDateString({ message: DATE_INVALID })
  date: Date

  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: NUMBER_INVALID }
  )
  @Min(0, { message: LESSON_DURATION_TOO_SHORT })
  @Max(1000, { message: LESSON_DURATION_TOO_LONG })
  duration: number

  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => LessonParticipantDto)
  participants: LessonParticipantDto[]
}
