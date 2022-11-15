import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common'

import { ServerUrl } from '../decorators/server-url.decorator'
import { User } from '../users/schemas'
import { SerializeUser } from '../decorators'
import { LocalAuthGuard } from './guards'
import {
  RefreshTokenDto,
  SignUpDto,
  ChangePasswordDto,
  InitiatePasswordDto,
  ChangeEmailDto,
} from './dtos'
import { AuthService } from './auth.service'
import { CurrentUser, IsAdmin, IsAuthenticated } from './decorators'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/refresh')
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @IsAuthenticated()
  @IsAdmin()
  @Post('/createUser')
  createUser(@Body() body: SignUpDto) {
    return this.authService.createUser(body.email, body.role)
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@CurrentUser() currentUser: User) {
    return this.authService.login(currentUser)
  }

  @SerializeUser()
  @IsAuthenticated()
  @Get('/whoami')
  whoAmI(@CurrentUser() currentUser: User) {
    return currentUser
  }

  @IsAuthenticated()
  @Patch('/changeEmail')
  changeEmail(
    @CurrentUser() currentUser: User,
    @Body() body: ChangeEmailDto,
    @ServerUrl() serverUrl: string
  ) {
    return this.authService.changeEmail(currentUser, body.newEmail, serverUrl)
  }

  @IsAuthenticated()
  @Patch('/changePassword')
  changePassword(
    @CurrentUser() currentUser: User,
    @Body() body: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      currentUser,
      body.oldPassword,
      body.newPassword
    )
  }

  @Post('/initiatePassword')
  verifyEmail(@Body() body: InitiatePasswordDto) {
    return this.authService.initiatePassword(body.token, body.password)
  }
}
