import { UseGuards } from '@nestjs/common'

import { UserRoles } from '../../users/schemas'
import { JwtAuthGuard, RolesGuard } from '../guards'

export const IsAdmin = () =>
  UseGuards(JwtAuthGuard, RolesGuard(UserRoles.Admin))
export const IsTeacher = () =>
  UseGuards(JwtAuthGuard, RolesGuard(UserRoles.Admin, UserRoles.Teacher))
