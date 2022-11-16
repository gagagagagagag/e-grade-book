import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { User, UserRoles } from '../users/schemas'
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
    name: 'test name',
    role: UserRoles.Admin,
    email: 'test@test.com',
    passwordInitiated: true,
    password: '34j5h345hj34b5jh43',
  }

  beforeEach(async () => {
    fakeConfigService = {
      getOrThrow: () => '10',
    }
    fakeMailerService = {
      sendWelcomeEmail: jest.fn(),
    }
    fakeUsersService = {
      create: jest
        .fn()
        .mockImplementation((email, password) =>
          Promise.resolve({ ...user, email, password })
        ),
      findOneByEmail: (email) =>
        Promise.resolve(!email ? null : { ...user, email }),
      update: jest
        .fn()
        .mockImplementation((id, attrs) =>
          Promise.resolve({ ...user, id, ...attrs })
        ),
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
      signInitiatePasswordToken: jest.fn(),
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

  describe('#validateUser', () => {
    it('should validate the user if password is correct', async () => {
      const result = await service.validateUser(user.email, user.password!)

      expect(result).not.toBeNull()
      expect(result?.email).toEqual(user.email)
    })

    it('should return null if the password is incorrect', async () => {
      jest
        .mocked(bcrypt.compare)
        .mockImplementation(() => Promise.resolve(false))

      const result = await service.validateUser(user.email, user.password!)

      expect(result).toBeNull()
    })

    it('should return null if the user is not found', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)

      const result = await service.validateUser(user.email, user.password!)

      expect(result).toBeNull()
    })
  })

  describe('#createUser', () => {
    it('should create a new user', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)

      const result = await service.createUser({
        email: user.email,
        name: user.name,
        role: user.role,
      })

      expect(result).toEqual(true)
      expect(fakeUsersService.create).toHaveBeenCalledTimes(1)
      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if email is already in use', async () => {
      await expect(
        service.createUser({
          email: user.email,
          name: user.name,
          role: user.role,
        })
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#refreshToken', () => {
    it('should generate new access and refresh token', async () => {
      const result = await service.refreshToken('token')

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
    })
  })

  describe('#changePassword', () => {
    it('should update the users password and return true', async () => {
      const result = await service.changePassword(user, '435nkj3n5', 'changed')

      expect(result).toEqual(true)
      expect(fakeUsersService.update).toHaveBeenCalledTimes(1)
      expect(fakeUsersService.update).toHaveBeenCalledWith(user.id, {
        password: 'changed',
      })
    })

    it('should throw if old password is incorrect', async () => {
      jest
        .mocked(bcrypt.compare)
        .mockImplementation(() => Promise.resolve(false))

      await expect(
        service.changePassword(user, user.password!, 'test')
      ).rejects.toThrow(BadRequestException)
    })
  })
})
