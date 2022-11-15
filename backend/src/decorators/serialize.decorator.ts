import { UseInterceptors } from '@nestjs/common'

import { SerializeInterceptor } from '../interceptors'
import { UserDto } from '../users/dtos'

interface ClassConstructor {
  new (...args: any[]): object
}

export const Serialize = (dto: ClassConstructor) =>
  UseInterceptors(new SerializeInterceptor(dto))

export const SerializeUser = () => Serialize(UserDto)
