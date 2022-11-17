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
  IsEnum,
  ValidateNested,
  IsString,
} from 'class-validator'

import { LessonHomework, LessonPresence } from '../lesson.schema'

class LessonParticipantDto {
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

export class CreateLessonDto {
  @IsOptional()
  @IsMongoId()
  student?: string

  @IsOptional()
  @IsMongoId()
  group?: string

  @IsDateString()
  date: Date

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @Min(0)
  @Max(1000)
  duration: number

  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => LessonParticipantDto)
  participants: LessonParticipantDto[]
}
