import { NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { User, UserDocument } from './schemas'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let fakeUserModel: Partial<Model<UserDocument>>

  beforeEach(async () => {
    fakeUserModel = {
      findOne: jest.fn().mockReturnValue({ exec: () => {} }),
      findById: jest.fn().mockReturnValue({ exec: () => {} }),
      findByIdAndUpdate: jest
        .fn()
        .mockImplementation((id, update) => ({ id, ...update })),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: fakeUserModel,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })
  const id = 'test-id'
  const email = 'test@test.com'

  describe('#update', () => {
    it('should throw an error if the user is not found', async () => {
      jest.spyOn(fakeUserModel, 'findByIdAndUpdate').mockResolvedValue(null)

      await expect(service.update(id, { email })).rejects.toThrow(
        NotFoundException
      )
    })

    it('should return the updated user on success', async () => {
      const result = await service.update(id, { email })

      expect(result).toBeDefined()
      expect(result).toMatchObject({
        id,
        email,
      })
      expect(fakeUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { email },
        { new: true }
      )
    })
  })

  describe('#findOneById', () => {
    it('should return null if id is not provided', async () => {
      const result = await service.findOneById(null)

      expect(result).toBeNull()
      expect(fakeUserModel.findById).not.toBeCalled()
    })

    it('should call findById with the provided id', async () => {
      await service.findOneById(id)

      expect(fakeUserModel.findById).toHaveBeenCalledTimes(1)
      expect(fakeUserModel.findById).toHaveBeenCalledWith(id)
    })
  })

  describe('#findOneByEmail', () => {
    const selector = '+password'

    it('should return null if email is not provided', async () => {
      const result = await service.findOneByEmail(null)

      expect(result).toBeNull()
      expect(fakeUserModel.findOne).not.toBeCalled()
    })

    it('should call findOne with the email and the selector', async () => {
      await service.findOneByEmail(email, selector)

      expect(fakeUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(fakeUserModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email }),
        selector
      )
    })

    it('should call findOne with empty selector by default', async () => {
      await service.findOneByEmail(email)

      expect(fakeUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(fakeUserModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email }),
        ''
      )
    })
  })
})
