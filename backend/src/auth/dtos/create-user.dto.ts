import {
  IsEmail,
  IsEnum,
  NotEquals,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator'

import { UserRoles } from '../../users/schemas'

export class CreateUserDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  password?: string

  @IsEmail()
  email: string

  @IsEnum(UserRoles)
  @NotEquals(UserRoles.Admin)
  role: UserRoles

  @IsBoolean()
  sendEmail: boolean
}
