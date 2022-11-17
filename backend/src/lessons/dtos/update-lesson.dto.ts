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

export class UpdateLessonDto {
  @IsOptional()
  @IsDateString()
  date?: Date

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @Min(0)
  @Max(1000)
  duration?: number

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => LessonParticipantDto)
  participants?: LessonParticipantDto[]
}
