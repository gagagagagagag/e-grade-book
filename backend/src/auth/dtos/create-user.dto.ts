import { IsEmail, IsEnum, NotEquals, IsString } from 'class-validator'

import { UserRoles } from '../../users/schemas'

export class CreateUserDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsEnum(UserRoles)
  @NotEquals(UserRoles.Admin)
  role: UserRoles
}
