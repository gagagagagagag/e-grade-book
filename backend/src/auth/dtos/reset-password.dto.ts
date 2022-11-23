import { IsJWT } from 'class-validator'

import { IsPassword } from '../../decorators'
import { JWT_INVALID } from '../../utils/validation-errors'

export class ResetPasswordDto {
  @IsJWT({ message: JWT_INVALID })
  token: string

  @IsPassword()
  password: string
}
