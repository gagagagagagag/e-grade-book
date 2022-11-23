import {
  IsEmail,
  IsEnum,
  NotEquals,
  IsOptional,
  IsBoolean,
} from 'class-validator'

import { IsName, IsPassword } from '../../decorators'
import { UserRoles } from '../../users/schemas'

import {
  BOOLEAN_INVALID,
  EMAIL_INVALID,
  ROLE_INVALID,
} from '../../utils/validation-errors'

export class CreateUserDto {
  @IsName()
  name: string

  @IsOptional()
  @IsPassword()
  password?: string

  @IsEmail({}, { message: EMAIL_INVALID })
  email: string

  @IsEnum(UserRoles, { message: ROLE_INVALID })
  @NotEquals(UserRoles.Admin, {
    message: 'Administratorzy nie mogą być tworzeni',
  })
  role: UserRoles

  @IsBoolean({ message: BOOLEAN_INVALID })
  sendEmail: boolean
}
