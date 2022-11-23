import { IsEmail } from 'class-validator'

import { EMAIL_INVALID } from '../../utils/validation-errors'

export class ChangeEmailDto {
  @IsEmail({}, { message: EMAIL_INVALID })
  newEmail: string
}
