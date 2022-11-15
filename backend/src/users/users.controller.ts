import { Controller } from '@nestjs/common'

import { IsAuthenticated } from '../auth/decorators'
import { UsersService } from './users.service'

@IsAuthenticated()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
