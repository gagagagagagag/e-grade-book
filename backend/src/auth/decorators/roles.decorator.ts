import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common'

import { UserRoles } from '../../users/schemas'
import { JwtAuthGuard, RolesGuard } from '../guards'

export const CurrentUserRole = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.user.role
  }
)

export const IsAdmin = () =>
  UseGuards(JwtAuthGuard, RolesGuard(UserRoles.Admin))
export const IsTeacher = (allowAdmin = true) =>
  UseGuards(
    JwtAuthGuard,
    allowAdmin
      ? RolesGuard(UserRoles.Admin, UserRoles.Teacher)
      : RolesGuard(UserRoles.Teacher)
  )
