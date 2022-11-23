import { IsEmail, IsMongoId, IsOptional } from 'class-validator'

import { EMAIL_INVALID, USER_ID_INVALID } from '../../utils/validation-errors'

export class SendPasswordLinkDto {
  @IsOptional()
  @IsMongoId({ message: USER_ID_INVALID })
  userId?: string

  @IsOptional()
  @IsEmail({ message: EMAIL_INVALID })
  email?: string
}
