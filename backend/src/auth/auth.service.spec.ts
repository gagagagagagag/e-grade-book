import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { User } from '../users/user.schema'
import { UsersService } from '../users/users.service'
import { MailerService } from '../mailer/mailer.service'
import { AuthService } from './auth.service'
import { TokenTypes } from './token.const'
import { TokenService } from './token.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let fakeConfigService: Partial<ConfigService>
  let fakeUsersService: Partial<UsersService>
  let fakeTokenService: Partial<TokenService>
  let fakeMailerService: Partial<MailerService>

  const user: User = {
    id: '43hj5b34',
    _id: new Types.ObjectId(),
    email: 'test@test.com',
    emailVerified: false,
    password: '34j5h345hj34b5jh43',
  }

  beforeEach(async () => {
    fakeConfigService = {
      getOrThrow: () => '10',
    }
    fakeMailerService = {
      sendVerifyEmailAddress: () => Promise.resolve(),
    }
    fakeUsersService = {
      create: (email, password) =>
        Promise.resolve({ ...user, email, password }),
      findOneByEmail: (email) =>
        Promise.resolve(!email ? null : { ...user, email }),
      update: (id, attrs) => Promise.resolve({ ...user, id, ...attrs }),
    }
    fakeTokenService = {
      signAuthTokens: () =>
        Promise.resolve({
          accessToken: 'fsdf34f3',
          refreshToken: 'j54njn56kj',
        }),
      verifyRefreshToken: () =>
        Promise.resolve({
          id: '43h5jb345h',
          email: user.email,
          type: TokenTypes.Refresh,
        }),
      signMailToken: () => Promise.resolve('4jk543hb53j4h'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
        {
          provide: TokenService,
          useValue: fakeTokenService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: MailerService,
          useValue: fakeMailerService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  beforeEach(() => {
    jest.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true))
    jest
      .mocked(bcrypt.hash)
      .mockImplementation((password) => Promise.resolve(password))
  })

  it('should validate the user if password is correct', async () => {
    const result = await service.validateUser(user.email, user.password)

    expect(result).not.toBeNull()
    expect(result?.email).toEqual(user.email)
  })

  it('should return null if the password is incorrect', async () => {
    jest.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(false))

    const result = await service.validateUser(user.email, user.password)

    expect(result).toBeNull()
  })

  it('should return null if the user is not found', async () => {
    fakeUsersService.findOneByEmail = () => Promise.resolve(null)

    const result = await service.validateUser(user.email, user.password)

    expect(result).toBeNull()
  })

  it('should create a new user', async () => {
    fakeUsersService.findOneByEmail = () => Promise.resolve(null)
    const createMock = jest.spyOn(fakeUsersService, 'create')
    const sendVerifyEmailMock = jest.spyOn(
      fakeMailerService,
      'sendVerifyEmailAddress'
    )

    const result = await service.signup(user.email, user.password, 'server_url')

    expect(result).toEqual(true)
    expect(createMock).toHaveBeenCalledTimes(1)
    expect(sendVerifyEmailMock).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if email is already in use', async () => {
    await expect(
      service.signup(user.email, user.password, 'server_url')
    ).rejects.toThrow(BadRequestException)
  })

  it('should generate new access and refresh token', async () => {
    const result = await service.refreshToken('token')

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
  })

  it('should update the users password and return true', async () => {
    const updateMock = jest.spyOn(fakeUsersService, 'update')

    const result = await service.changePassword(user, '435nkj3n5', 'changed')

    expect(result).toEqual(true)
    expect(updateMock).toHaveBeenCalledTimes(1)
    expect(updateMock).toHaveBeenCalledWith(user.id, { password: 'changed' })
  })

  it('should throw if old password is incorrect', async () => {
    jest.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(false))

    await expect(
      service.changePassword(user, user.password, 'test')
    ).rejects.toThrow(BadRequestException)
  })
})
