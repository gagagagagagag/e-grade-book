import { IsEmail, IsEnum, NotEquals } from 'class-validator'

import { UserRoles } from '../../users/schemas'

export class SignUpDto {
  @IsEmail()
  email: string

  @IsEnum(UserRoles)
  @NotEquals(UserRoles.Admin)
  role: UserRoles
}
