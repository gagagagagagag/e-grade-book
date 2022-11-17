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

import { LessonParticipantDto } from './lesson-participant.dto'

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
