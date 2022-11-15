import { SetMetadata } from '@nestjs/common'

import { UserRoles } from '../../users/schemas'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles)

export const IsAdmin = () => Roles(UserRoles.Admin)
export const IsTeacher = () => Roles(UserRoles.Admin, UserRoles.Teacher)
