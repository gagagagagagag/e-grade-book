import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { generateTestPaginationOptions } from '../utils/stubs/pagination-options.stub'
import { ParentsService } from './parents.service'

import { User, UserDocument, UserRoles } from './schemas'
import { TeachersService } from './teachers.service'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let fakeUserModel: Partial<Model<UserDocument>>
  let fakeTeachersService: Partial<TeachersService>
  let fakeParentsService: Partial<ParentsService>

  beforeEach(async () => {
    fakeUserModel = {
      countDocuments: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn().mockReturnValue({ exec: () => {} }),
      findById: jest.fn().mockReturnValue({ exec: () => {} }),
      findByIdAndUpdate: jest
        .fn()
        .mockImplementation((id, update) => ({ id, ...update })),
    }
    fakeParentsService = {
      assignStudent: jest.fn(),
    }
    fakeTeachersService = {
      assignStudent: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: fakeUserModel,
        },
        {
          provide: TeachersService,
          useValue: fakeTeachersService,
        },
        {
          provide: ParentsService,
          useValue: fakeParentsService,
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

  describe('#findUserWithRole', () => {
    it('should return null if user is not found', async () => {
      fakeUserModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve(null) })

      const result = await service.findUserWithRole(id, UserRoles.Student)

      expect(result).toBeNull()
    })

    it('should call findOne with the desired role', async () => {
      fakeUserModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve(null) })

      await service.findUserWithRole(id, UserRoles.Student)

      expect(fakeUserModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRoles.Student,
        })
      )
    })
  })

  describe('#countUsersWithRole', () => {
    it('should not call the database if array length is empty', async () => {
      const result = await service.countUsersWithRole([], UserRoles.Student)

      expect(result).toBe(0)
      expect(fakeUserModel.countDocuments).not.toHaveBeenCalled()
    })

    it('should return the documents count, with selected role', async () => {
      await service.countUsersWithRole([id], UserRoles.Student)

      expect(fakeUserModel.countDocuments).toHaveBeenCalled()
      expect(fakeUserModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          role: { $eq: UserRoles.Student },
        })
      )
    })
  })

  describe('#assertUsersHaveRole', () => {
    beforeEach(() => {
      jest.spyOn(service, 'countUsersWithRole').mockResolvedValue(1)
    })

    it('should not throw if values are equal', async () => {
      await service.assertUsersHaveRole(['test_user'], UserRoles.Student)
    })

    it('should throw if values differ', async () => {
      await expect(
        service.assertUsersHaveRole(
          ['test_user', 'test_user2'],
          UserRoles.Student
        )
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#getUsers', () => {
    const data = ['test']

    it('should attach role filter if present', async () => {
      const paginationOptions = generateTestPaginationOptions()

      await service.getUsers(paginationOptions, {
        role: UserRoles.Student,
      })

      expect(fakeUserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          role: { $eq: UserRoles.Student },
        }),
        null,
        expect.anything()
      )
    })

    it('should call pagination options with data and count', async () => {
      fakeUserModel.find = jest.fn().mockResolvedValue(data)
      fakeUserModel.countDocuments = jest.fn().mockResolvedValue(data.length)
      const paginationOptions = generateTestPaginationOptions()
      paginationOptions.createResponse = jest.fn()

      await service.getUsers(paginationOptions, {})

      expect(paginationOptions.createResponse).toHaveBeenCalledWith(
        data,
        data.length
      )
    })
  })

  describe('#assignStudent', () => {
    const studentId = 'studentId'
    const targetId = 'targetId'

    describe('target -> teacher', () => {
      beforeEach(() => {
        jest
          .spyOn(service, 'findUserWithRole')
          .mockReturnValue({ id: studentId } as any)
        jest.spyOn(service, 'findOneById').mockImplementation((id) =>
          Promise.resolve({
            id,
            role: id === studentId ? UserRoles.Student : UserRoles.Teacher,
          } as unknown as User)
        )
      })

      it('should call the teacher service', async () => {
        await service.assignStudent(targetId, studentId, true)

        expect(fakeTeachersService.assignStudent).toHaveBeenCalled()
        expect(fakeParentsService.assignStudent).not.toHaveBeenCalled()
      })
    })

    describe('target -> parent', () => {
      beforeEach(() => {
        jest
          .spyOn(service, 'findUserWithRole')
          .mockReturnValue({ id: studentId } as any)
        jest.spyOn(service, 'findOneById').mockImplementation((id) =>
          Promise.resolve({
            id,
            role: id === studentId ? UserRoles.Student : UserRoles.Parent,
          } as unknown as User)
        )
      })

      it('should call the parent service', async () => {
        await service.assignStudent(targetId, studentId, true)

        expect(fakeParentsService.assignStudent).toHaveBeenCalled()
        expect(fakeTeachersService.assignStudent).not.toHaveBeenCalled()
      })
    })

    describe('errors', () => {
      it('should throw an error if the student is not a student', async () => {
        jest.spyOn(service, 'findUserWithRole').mockResolvedValue(null)

        await expect(
          service.assignStudent(targetId, studentId, true)
        ).rejects.toThrow(NotFoundException)
      })

      it('should throw if target is not found', async () => {
        jest
          .spyOn(service, 'findOneById')
          .mockImplementation((id) =>
            Promise.resolve(
              id === targetId
                ? null
                : ({ id, role: UserRoles.Student } as unknown as User)
            )
          )

        await expect(
          service.assignStudent(targetId, studentId, true)
        ).rejects.toThrow(NotFoundException)
      })

      it('should throw if the target is neither a teacher nor a parent', async () => {
        jest
          .spyOn(service, 'findUserWithRole')
          .mockResolvedValue({ id: studentId } as any)
        jest.spyOn(service, 'findOneById').mockImplementation((id) =>
          Promise.resolve({
            id,
            role: id === studentId ? UserRoles.Student : UserRoles.Admin,
          } as unknown as User)
        )

        await expect(
          service.assignStudent(targetId, studentId, true)
        ).rejects.toThrow(BadRequestException)
      })
    })
  })
})
