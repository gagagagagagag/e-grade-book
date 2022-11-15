import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const ServerUrl = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>()

    return `${request.protocol}://${request.get('host')}`
  }
)
