import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { User } from '../users/schemas'
import { LocalAuthGuard } from './guards'
import {
  RefreshTokenDto,
  CreateUserDto,
  ChangePasswordDto,
  InitiatePasswordDto,
  ChangeEmailDto,
  SendPasswordLinkDto,
  ResetPasswordDto,
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

  @IsAdmin()
  @Post('/createUser')
  createUser(@Body() body: CreateUserDto) {
    return this.authService.createUser(body)
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@CurrentUser() currentUser: User) {
    return this.authService.login(currentUser)
  }

  @IsAuthenticated()
  @Get('/whoami')
  whoAmI(@CurrentUser() currentUser: User) {
    return currentUser
  }

  @IsAuthenticated()
  @Patch('/changeEmail')
  changeEmail(@CurrentUser() currentUser: User, @Body() body: ChangeEmailDto) {
    return this.authService.changeEmail(currentUser, body.newEmail)
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

  @Throttle(5, 60)
  @Post('/initiatePassword')
  initiatePassword(@Body() body: InitiatePasswordDto) {
    return this.authService.initiatePassword(body.token, body.password)
  }

  @Throttle(1, 60)
  @Post('/sendPasswordLink')
  sendPasswordLink(@Body() body: SendPasswordLinkDto) {
    return this.authService.sendPasswordLink({
      id: body.userId,
      email: body.email,
    })
  }

  @IsAdmin()
  @Post('/sendPasswordLink/admin')
  sendPasswordLinkNoRateLimit(@Body() body: SendPasswordLinkDto) {
    return this.authService.sendPasswordLink({
      id: body.userId,
      email: body.email,
    })
  }

  @Throttle(5, 60)
  @Post('/resetPassword')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password)
  }
}
