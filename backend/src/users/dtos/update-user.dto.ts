import { IsEmail, IsOptional } from 'class-validator'

import { IsName } from '../../decorators/custom-validators.decorator'
import { EMAIL_INVALID } from '../../utils/validation-errors'

export class UpdateUserDto {
  @IsOptional()
  @IsName()
  name?: string

  @IsOptional()
  @IsEmail({}, { message: EMAIL_INVALID })
  email?: string
}
