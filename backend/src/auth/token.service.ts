import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenExpiredError } from 'jsonwebtoken'

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

  private async signAccessToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.Access,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '60m' })
  }

  private async signRefreshToken(id: string, email: string) {
    const payload: JwtPayload = {
      id,
      email,
      type: TokenTypes.Refresh,
    }

    return this.jwtService.signAsync(payload, { expiresIn: '30 days' })
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
        throw new BadRequestException(
          'The supplied token is not a refresh token'
        )
      }

      const user = await this.usersService.findOneById(payload.id)

      if (!user || user.email !== payload.email) {
        throw new BadRequestException('The supplied token is invalid')
      }

      return payload
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired')
      }

      throw new BadRequestException('Invalid refresh token')
    }
  }

  async verifyInitiatePasswordToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

      if (payload.type !== TokenTypes.InitiatePassword) {
        throw new BadRequestException(
          'The supplied token is not a initiate password token'
        )
      }

      const user = await this.usersService.findOneById(payload.id)

      if (!user || user.email !== payload.email) {
        throw new BadRequestException('The supplied token is invalid')
      }

      if (user.passwordInitiated) {
        throw new BadRequestException(
          'The password has already been instantiated'
        )
      }

      return payload
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('The token has expired')
      }

      throw new BadRequestException('Invalid refresh token')
    }
  }
}
