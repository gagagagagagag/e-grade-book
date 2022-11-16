import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { PaginationOptionsDto } from '../dtos'

export const PaginationOptions = createParamDecorator(
  async (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    const dto = plainToInstance(PaginationOptionsDto, request.query, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    })

    const errors = await validate(dto)

    if (errors.length) {
      throw new BadRequestException('Wrong pagination options value provided')
    }

    return dto
  }
)
