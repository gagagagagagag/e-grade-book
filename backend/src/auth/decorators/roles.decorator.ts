import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common'

import { UserRoles } from '../../users/schemas'
import { JwtAuthGuard, RolesGuard } from '../guards'

export const UserRole = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.user.role
  }
)

export const IsAdmin = () =>
  UseGuards(JwtAuthGuard, RolesGuard(UserRoles.Admin))
export const IsTeacher = () =>
  UseGuards(JwtAuthGuard, RolesGuard(UserRoles.Admin, UserRoles.Teacher))
