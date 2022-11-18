import { BadRequestException, NotFoundException } from '@nestjs/common'
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
      sendResetPasswordEmail: jest.fn(),
    }
    fakeUsersService = {
      findOneById: jest.fn().mockResolvedValue({ passwordInitiated: true }),
      create: jest
        .fn()
        .mockImplementation((email, password) =>
          Promise.resolve({ ...user, email, password })
        ),
      findOneByEmail: jest
        .fn()
        .mockImplementation((email) =>
          Promise.resolve(!email ? null : { ...user, email })
        ),
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
      verifyResetPasswordToken: jest.fn(),
      signInitiatePasswordToken: jest.fn(),
      signResetPasswordToken: jest.fn(),
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
    it('should throw if password is provided and sendEmail is true', async () => {
      await expect(
        service.createUser({
          email: user.email,
          name: user.name,
          role: user.role,
          password: user.password,
          sendEmail: true,
        })
      ).rejects.toThrow(BadRequestException)
    })

    it('should create a new user', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)

      const result = await service.createUser({
        email: user.email,
        name: user.name,
        role: user.role,
        sendEmail: true,
      })

      expect(result).toEqual(true)
      expect(fakeUsersService.create).toHaveBeenCalledTimes(1)
      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalledTimes(1)
    })

    it('should not throw if sending email fails', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)
      fakeMailerService.sendWelcomeEmail = jest.fn().mockRejectedValue(null)

      await expect(
        service.createUser({
          email: user.email,
          name: user.name,
          role: user.role,
          sendEmail: true,
        })
      ).resolves.not.toThrow()
    })

    it('should create a user but not send an email if sendEmail is false', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)

      const result = await service.createUser({
        email: user.email,
        name: user.name,
        role: user.role,
        sendEmail: false,
      })

      expect(result).toEqual(true)
      expect(fakeUsersService.create).toHaveBeenCalledTimes(1)
      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalledTimes(0)
    })

    it('should create a user with a password if provided', async () => {
      fakeUsersService.findOneByEmail = () => Promise.resolve(null)

      const result = await service.createUser({
        email: user.email,
        name: user.name,
        role: user.role,
        password: user.password,
        sendEmail: false,
      })

      expect(result).toEqual(true)
      expect(fakeUsersService.create).toHaveBeenCalledTimes(1)
      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalledTimes(0)
    })

    it('should throw an error if email is already in use', async () => {
      await expect(
        service.createUser({
          email: user.email,
          name: user.name,
          role: user.role,
          sendEmail: true,
        })
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#sendInitiatePasswordEmail', () => {
    it('should create initiate password token', async () => {
      await service.sendInitiatePasswordEmail(user.id, user.email)

      expect(fakeTokenService.signInitiatePasswordToken).toHaveBeenCalled()
    })

    it('should call send welcome email', async () => {
      await service.sendInitiatePasswordEmail(user.id, user.email)

      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalled()
    })
  })

  describe('#sendResetPasswordEmail', () => {
    it('should create reset password token', async () => {
      await service.sendResetPasswordEmail(user.id, user.email)

      expect(fakeTokenService.signResetPasswordToken).toHaveBeenCalled()
    })

    it('should call send reset password email', async () => {
      await service.sendResetPasswordEmail(user.id, user.email)

      expect(fakeMailerService.sendResetPasswordEmail).toHaveBeenCalled()
    })
  })

  describe('#hashPassword', () => {
    it('should call bcrypt with data', async () => {
      const mockedHash = jest.fn()
      jest.spyOn(bcrypt, 'hash').mockImplementation(mockedHash)

      await service.hashPassword('password')

      expect(mockedHash).toHaveBeenCalledWith('password', 10)
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

  describe('#sendPasswordLink', () => {
    it('should throw if neither id nor email is provided', async () => {
      await expect(service.sendPasswordLink({})).rejects.toThrow(
        BadRequestException
      )
    })

    it('should throw if both id and email are provided', async () => {
      await expect(
        service.sendPasswordLink({ id: user.id, email: user.email })
      ).rejects.toThrow(BadRequestException)
    })

    it('should call findOneById if id provided', async () => {
      fakeUsersService.findOneById = jest
        .fn()
        .mockResolvedValue({ passwordInitiated: true })

      await service.sendPasswordLink({ id: user.id })

      expect(fakeUsersService.findOneById).toHaveBeenCalledWith(user.id)
      expect(fakeUsersService.findOneByEmail).not.toHaveBeenCalled()
    })

    it('should call findOneById if id provided', async () => {
      fakeUsersService.findOneByEmail = jest
        .fn()
        .mockResolvedValue({ passwordInitiated: true })

      await service.sendPasswordLink({ email: user.email })

      expect(fakeUsersService.findOneByEmail).toHaveBeenCalledWith(user.email)
      expect(fakeUsersService.findOneById).not.toHaveBeenCalled()
    })

    it('should throw if user is not found', async () => {
      fakeUsersService.findOneByEmail = jest.fn().mockResolvedValue(null)

      await expect(
        service.sendPasswordLink({ email: user.email })
      ).rejects.toThrow(NotFoundException)
    })

    it('should send initiate password if password not initiated', async () => {
      fakeUsersService.findOneByEmail = jest
        .fn()
        .mockResolvedValue({ passwordInitiated: false })

      await service.sendPasswordLink({ email: user.email })

      expect(fakeMailerService.sendWelcomeEmail).toHaveBeenCalled()
      expect(fakeMailerService.sendResetPasswordEmail).not.toHaveBeenCalled()
    })

    it('should send reset password if password initiated', async () => {
      fakeUsersService.findOneByEmail = jest
        .fn()
        .mockResolvedValue({ passwordInitiated: true })

      await service.sendPasswordLink({ email: user.email })

      expect(fakeMailerService.sendResetPasswordEmail).toHaveBeenCalled()
      expect(fakeMailerService.sendWelcomeEmail).not.toHaveBeenCalled()
    })

    it('should throw if sending email fails', async () => {
      fakeUsersService.findOneByEmail = jest
        .fn()
        .mockResolvedValue({ passwordInitiated: false })
      jest
        .spyOn(service, 'sendInitiatePasswordEmail')
        .mockImplementation(() => {
          throw new Error()
        })

      await expect(
        service.sendPasswordLink({ email: user.email })
      ).rejects.toThrow()
    })
  })

  describe('#resetPassword', () => {
    const token = 'token'
    const password = 'password'

    it('should verify token and call update', async () => {
      fakeTokenService.verifyResetPasswordToken = jest
        .fn()
        .mockResolvedValue({ id: user.id })
      const mockedHashPassword = jest.fn()
      jest.spyOn(service, 'hashPassword').mockImplementation(mockedHashPassword)

      await service.resetPassword(token, password)

      expect(fakeTokenService.verifyResetPasswordToken).toHaveBeenCalledWith(
        token
      )
      expect(mockedHashPassword).toHaveBeenCalledWith(password)
    })
  })
})
