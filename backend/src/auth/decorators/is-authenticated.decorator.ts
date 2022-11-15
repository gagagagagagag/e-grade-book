import { UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../guards'

export const IsAuthenticated = () => {
  return UseGuards(JwtAuthGuard)
}
