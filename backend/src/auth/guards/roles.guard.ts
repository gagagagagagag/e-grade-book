import { CanActivate, ExecutionContext, mixin } from '@nestjs/common'

import { User } from '../../users/schemas'
import { UserRoles } from '../../users/schemas'

export const RolesGuard = (...requiredRoles: UserRoles[]) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      if (requiredRoles.length === 0) {
        return true
      }

      const request = context.switchToHttp().getRequest()
      const typedUser = request.user as User

      return requiredRoles.some((role) => role === typedUser.role)
    }
  }

  return mixin(RolesGuardMixin)
}
