import {
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'

import { LessonParticipantDto } from './lesson-participant.dto'
import {
  DATE_INVALID,
  LESSON_DURATION_TOO_LONG,
  LESSON_DURATION_TOO_SHORT,
  NUMBER_INVALID,
} from '../../utils/validation-errors'

export class UpdateLessonDto {
  @IsOptional()
  @IsDateString({}, { message: DATE_INVALID })
  date?: Date

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: NUMBER_INVALID }
  )
  @Min(0, { message: LESSON_DURATION_TOO_SHORT })
  @Max(1000, { message: LESSON_DURATION_TOO_LONG })
  duration?: number

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => LessonParticipantDto)
  participants?: LessonParticipantDto[]
}
