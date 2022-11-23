import { IsArray, IsMongoId, IsOptional } from 'class-validator'

import { IsName } from '../../decorators'
import { STUDENT_ID_INVALID } from '../../utils/validation-errors'

export class UpdateGroupDto {
  @IsOptional()
  @IsName()
  name?: string

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: STUDENT_ID_INVALID })
  students?: string[]
}
