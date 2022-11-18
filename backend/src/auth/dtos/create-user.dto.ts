import {
  IsEmail,
  IsEnum,
  NotEquals,
  IsString,
  IsOptional,
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
}
