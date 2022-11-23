import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenExpiredError } from 'jsonwebtoken'

import {
  PASSWORD_NOT_INITIATED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
} from '../utils/validation-errors'
import { UsersService } from '../users/users.service'
import { JwtPayload, TokenTypes } from './token.const'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async signInitiatePasswordToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.InitiatePassword,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '7 days' })
  }

  async signResetPasswordToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.ResetPassword,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '7 days' })
  }

  private async signAccessToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.Access,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '180m' })
  }

  private async signRefreshToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.Refresh,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '1 days' })
  }

  async signAuthTokens(id: string, email: string) {
    return {
      accessToken: await this.signAccessToken(id, email),
      refreshToken: await this.signRefreshToken(id, email),
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

      if (payload.type !== TokenTypes.Refresh) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      const user = await this.usersService.findOneById(payload.id)

      if (!user || user.email !== payload.email) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      return payload
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_EXPIRED)
      }

      throw new BadRequestException(TOKEN_INVALID)
    }
  }

  async verifyResetPasswordToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

      if (payload.type !== TokenTypes.ResetPassword) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      const user = await this.usersService.findOneById(payload.id)

      if (!user || user.email !== payload.email) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      if (!user.passwordInitiated) {
        throw new BadRequestException(PASSWORD_NOT_INITIATED)
      }

      return payload
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_EXPIRED)
      }

      throw new BadRequestException(TOKEN_INVALID)
    }
  }

  async verifyInitiatePasswordToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

      if (payload.type !== TokenTypes.InitiatePassword) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      const user = await this.usersService.findOneById(payload.id)

      if (!user || user.email !== payload.email) {
        throw new BadRequestException(TOKEN_INVALID)
      }

      if (user.passwordInitiated) {
        throw new BadRequestException('Hasło zostało już stworzone')
      }

      return payload
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_EXPIRED)
      }

      throw new BadRequestException(TOKEN_INVALID)
    }
  }
}
