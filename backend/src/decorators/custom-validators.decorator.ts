import { applyDecorators } from '@nestjs/common'
import { IsString, MaxLength, MinLength } from 'class-validator'

import {
  PASSOWRD_TOO_LONG,
  PASSWORD_TOO_SHORT,
  STRING_INVALID,
} from '../utils/validation-errors'

export const IsPassword = () =>
  applyDecorators(
    IsString({ message: STRING_INVALID }),
    MinLength(8, { message: PASSWORD_TOO_SHORT }),
    MaxLength(60, { message: PASSOWRD_TOO_LONG })
  )

export const IsName = () =>
  applyDecorators(
    IsString({ message: STRING_INVALID }),
    MinLength(1, { message: 'Nazwa jest wymagana' }),
    MaxLength(100, {
      message: 'Nazwa może mieć maksymalnie $constraint1 znaków',
    })
  )
