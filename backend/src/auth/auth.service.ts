import * as bcrypt from 'bcrypt'
import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { MailerService } from '../mailer/mailer.service'
import { UsersService } from '../users/users.service'
import { User } from '../users/schemas'
import { TokenService } from './token.service'
import { CreateUserDto } from './dtos'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email, '+password')

    if (!user || !user.passwordInitiated || !user.password) {
      return null
    }

    if (await bcrypt.compare(password, user.password)) {
      return user
    }

    return null
  }

  async login(user: User) {
    return this.tokenService.signAuthTokens(user.id, user.email)
  }

  async createUser(data: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(data.email)

    if (existingUser) {
      throw new BadRequestException('Email already in use')
    }

    const createdUser = await this.usersService.create(
      data.name,
      data.email,
      data.role
    )

    await this.mailerService.sendWelcomeEmail(
      createdUser.email,
      await this.tokenService.signInitiatePasswordToken(
        createdUser.id,
        createdUser.email
      )
    )

    return true
  }

  async refreshToken(token: string) {
    const payload = await this.tokenService.verifyRefreshToken(token)

    return this.tokenService.signAuthTokens(payload.id, payload.email)
  }

  async changeEmail(user: User, newEmail: string) {
    const existingUser = await this.usersService.findOneByEmail(newEmail)

    if (existingUser) {
      throw new BadRequestException('Email aleady in use')
    }

    await this.usersService.update(user.id, {
      email: newEmail,
    })

    return true
  }

  async changePassword(user: User, oldPassword: string, newPassword: string) {
    if ((await this.validateUser(user.email, oldPassword)) === null) {
      throw new BadRequestException('The provided password is incorrect')
    }

    const hash = await bcrypt.hash(
      newPassword,
      +this.configService.getOrThrow<string>('SALT_ROUNDS')
    )

    await this.usersService.update(user.id, { password: hash })

    return true
  }

  async initiatePassword(token: string, password: string) {
    const payload = await this.tokenService.verifyInitiatePasswordToken(token)

    await this.usersService.update(payload.id, {
      password: await bcrypt.hash(
        password,
        +this.configService.getOrThrow<string>('SALT_ROUNDS')
      ),
      passwordInitiated: true,
    })

    return true
  }
}
