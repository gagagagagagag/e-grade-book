import * as bcrypt from 'bcrypt'
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
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
    await this.usersService.update(user.id, { lastLogin: new Date() })

    return this.tokenService.signAuthTokens(user.id, user.email)
  }

  async createUser(data: CreateUserDto) {
    if (data.sendEmail && data.password) {
      throw new BadRequestException(
        "If password is provided, email won't be sent"
      )
    }

    const existingUser = await this.usersService.findOneByEmail(data.email)

    if (existingUser) {
      throw new BadRequestException('Email already in use')
    }

    let hashedPassword: string | undefined = undefined
    if (data.password) {
      hashedPassword = await this.hashPassword(data.password)
    }

    const createdUser = await this.usersService.create(
      data.name,
      data.email,
      data.role,
      hashedPassword
    )

    if (!hashedPassword && data.sendEmail) {
      await this.sendInitiatePasswordEmail(
        createdUser.id,
        createdUser.email
      ).then(null, () => null)
    }

    return true
  }

  async sendInitiatePasswordEmail(id: string, email: string) {
    return this.mailerService.sendWelcomeEmail(
      email,
      await this.tokenService.signInitiatePasswordToken(id, email)
    )
  }

  async sendResetPasswordEmail(id: string, email: string) {
    return this.mailerService.sendResetPasswordEmail(
      email,
      await this.tokenService.signResetPasswordToken(id, email)
    )
  }

  async hashPassword(password: string) {
    return bcrypt.hash(
      password,
      +this.configService.getOrThrow<string>('SALT_ROUNDS')
    )
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

    const hash = await this.hashPassword(newPassword)

    await this.usersService.update(user.id, { password: hash })

    return true
  }

  async initiatePassword(token: string, password: string) {
    const payload = await this.tokenService.verifyInitiatePasswordToken(token)

    await this.usersService.update(payload.id, {
      password: await this.hashPassword(password),
      passwordInitiated: true,
    })

    return true
  }

  async sendPasswordLink({ id, email }: { id?: string; email?: string }) {
    let user: User | null
    if (id && !email) {
      user = await this.usersService.findOneById(id)
    } else if (email && !id) {
      user = await this.usersService.findOneByEmail(email)
    } else {
      throw new BadRequestException('Only id or email should be provided')
    }

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.passwordInitiated) {
      await this.sendInitiatePasswordEmail(user.id, user.email)
    } else {
      await this.sendResetPasswordEmail(user.id, user.email)
    }

    return true
  }

  async resetPassword(token: string, password: string) {
    const payload = await this.tokenService.verifyResetPasswordToken(token)

    await this.usersService.update(payload.id, {
      password: await this.hashPassword(password),
    })

    return true
  }
}
