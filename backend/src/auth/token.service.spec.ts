import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { TokenExpiredError } from 'jsonwebtoken'

import { UsersService } from '../users/users.service'
import { TokenService } from './token.service'
import { TokenTypes } from './token.const'

describe('TokenService', () => {
  let service: TokenService
  let fakeJwtService: Partial<JwtService>
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    fakeJwtService = {
      signAsync: () => Promise.resolve('token'),
      verifyAsync: () =>
        Promise.resolve({
          type: TokenTypes.Refresh,
          id: 'b5jh43b534jb',
          email: 'test@test.com',
        } as any),
    }
    fakeUsersService = {
      findOneById: (id) =>
        Promise.resolve(
          id
            ? ({
                id,
                email: 'test@test.com',
                emailVerified: true,
                password: '34j5nk34',
              } as any)
            : null
        ),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile()

    service = module.get<TokenService>(TokenService)
  })

  it('should create a access and refresh token', async () => {
    const response = await service.signAuthTokens('id', 'email')

    expect(response.accessToken).toBeDefined()
    expect(response.refreshToken).toBeDefined()
  })

  it('should verify the refresh token', async () => {
    const response = await service.verifyRefreshToken('refresh_token')

    expect(response).toHaveProperty('id')
    expect(response).toHaveProperty('email')
    expect(response).toHaveProperty('type', TokenTypes.Refresh)
  })

  it('should throw an unauthorized exception if the refresh token is expired', async () => {
    fakeJwtService.verifyAsync = () =>
      Promise.reject(new TokenExpiredError('Token expired', new Date()))

    await expect(service.verifyRefreshToken('refresh_token')).rejects.toThrow(
      UnauthorizedException
    )
  })

  it('should throw a bad request exception if the refresh token is invalid', async () => {
    fakeJwtService.verifyAsync = () => Promise.reject(new Error())

    await expect(service.verifyRefreshToken('refresh_token')).rejects.toThrow(
      BadRequestException
    )
  })

  it('should throw a bad request exception if the provided token is not a refresh token', async () => {
    fakeJwtService.verifyAsync = () =>
      Promise.resolve({
        type: 'access',
        id: 'b5jh43b534jb',
        email: 'test@test.com',
      } as any)

    await expect(service.verifyRefreshToken('refresh_token')).rejects.toThrow(
      BadRequestException
    )
  })
})
