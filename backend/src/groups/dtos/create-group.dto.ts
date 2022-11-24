import { IsOptional, IsArray, IsMongoId } from 'class-validator'

import { STUDENT_ID_INVALID } from '../../utils/validation-errors'
import { IsName } from '../../decorators'

export class CreateGroupDto {
  @IsName()
  name: string

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: STUDENT_ID_INVALID })
  students?: string[]
}
