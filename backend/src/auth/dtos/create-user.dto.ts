import { IsEmail, IsEnum, NotEquals } from 'class-validator'

import { UserRoles } from '../../users/schemas'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsEnum(UserRoles)
  @NotEquals(UserRoles.Admin)
  role: UserRoles
}
