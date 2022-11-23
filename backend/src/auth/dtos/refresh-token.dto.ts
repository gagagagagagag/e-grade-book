import { IsJWT } from 'class-validator'

import { JWT_INVALID } from '../../utils/validation-errors'

export class RefreshTokenDto {
  @IsJWT({ message: JWT_INVALID })
  refreshToken: string
}
