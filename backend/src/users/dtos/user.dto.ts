import { Expose } from 'class-transformer'

import { UserRoles } from '../schemas'

export class UserDto {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  role: UserRoles
}
