import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { GroupsService } from '../groups/groups.service'
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
  let fakeGroupsService: Partial<GroupsService>

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
      assertUserAssignedToParent: jest.fn(),
    }
    fakeTeachersService = {
      assertGroupAssignedToTeacher: jest.fn(),
      assertUserAssignedToTeacher: jest.fn(),
      assignStudent: jest.fn(),
      assignGroup: jest.fn(),
    }
    fakeGroupsService = {
      findOneById: jest.fn().mockResolvedValue(true),
      getUsersFromGroups: jest.fn().mockResolvedValue([id]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: fakeUserModel,
        },
        {
          provide: GroupsService,
          useValue: fakeGroupsService,
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
  const groupId = 'groupId'
  const teacherId = 'teacherId'
  const parentId = 'parentId'
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

  describe('#assertGroupAssignedToUser', () => {
    it('should throw if teacher not found', async () => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(null)

      await expect(
        service.assertGroupAssignedToUser(id, groupId)
      ).rejects.toThrow(NotFoundException)
    })

    it('should call the teachers service', async () => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(true as any)

      await service.assertGroupAssignedToUser(id, groupId)

      expect(
        fakeTeachersService.assertGroupAssignedToTeacher
      ).toHaveBeenCalled()
    })
  })

  describe('#assertUserAssignedToUser', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(true as any)
    })

    it('should throw an error if user not found', async () => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(null)

      await expect(
        service.assertUserAssignedToUser(teacherId, id)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw if target is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null)

      await expect(
        service.assertUserAssignedToUser(teacherId, id)
      ).rejects.toThrow(NotFoundException)
    })

    it('should call the teacher service if role is teacher', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ role: UserRoles.Teacher } as any)

      await service.assertUserAssignedToUser(teacherId, id)

      expect(fakeTeachersService.assertUserAssignedToTeacher).toHaveBeenCalled()
    })

    it('should not throw if the user is connected via a group and consider groups is true', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ role: UserRoles.Teacher, groups: [] } as any)

      await service.assertUserAssignedToUser(teacherId, id, true)

      expect(fakeGroupsService.getUsersFromGroups).toHaveBeenCalled()
      expect(
        fakeTeachersService.assertUserAssignedToTeacher
      ).not.toHaveBeenCalled()
    })

    it('should call the parent service if role is parent', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ role: UserRoles.Parent } as any)

      await service.assertUserAssignedToUser(parentId, id)

      expect(fakeParentsService.assertUserAssignedToParent).toHaveBeenCalled()
    })

    it('should throw if the role is neither teacher nor parent', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ role: UserRoles.Admin } as any)

      await expect(
        service.assertUserAssignedToUser(teacherId, id)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#getUser', () => {
    const assertMock = jest.fn()

    beforeEach(() => {
      assertMock.mockReset()
      jest
        .spyOn(service, 'assertUserAssignedToUser')
        .mockImplementation(assertMock)
      fakeUserModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve(true) })
    })

    it('should check if the user is assigned to the parent', async () => {
      await service.getUser(id, { id, role: UserRoles.Parent } as any)

      expect(assertMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        true
      )
    })

    it('should check if the user is assigned to the teacher', async () => {
      await service.getUser(id, { id, role: UserRoles.Teacher } as any)

      expect(assertMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        true
      )
    })

    it('should query for user id if student', async () => {
      await service.getUser(id, { id, role: UserRoles.Student } as any)

      expect(fakeUserModel.findOne).toHaveBeenCalledWith({ _id: id })
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
          role: UserRoles.Student,
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

  describe('#getAllUsers', () => {
    it('shuld set the role as the filter', async () => {
      await service.getAllUsers(UserRoles.Admin)

      expect(fakeUserModel.find).toBeCalledWith(
        expect.objectContaining({
          role: UserRoles.Admin,
        }),
        null,
        expect.anything()
      )
    })

    it('should throw if role is unknown', async () => {
      await expect(
        service.getAllUsers('unknownRole' as UserRoles)
      ).rejects.toThrow(BadRequestException)
    })

    it('should call findUserWithRole if notAssignedToTeacher is set on Student', async () => {
      const mockedFindUserWithRole = jest.fn(() =>
        Promise.resolve({ students: [] } as any)
      )
      jest
        .spyOn(service, 'findUserWithRole')
        .mockImplementation(mockedFindUserWithRole)

      await service.getAllUsers(UserRoles.Student, {
        notAssignedToTeacher: teacherId,
      })

      expect(mockedFindUserWithRole).toHaveBeenCalled()
    })

    it('should call findUserWithRole if notAssignedToParent is set on Student', async () => {
      const mockedFindUserWithRole = jest.fn(() =>
        Promise.resolve({ students: [] } as any)
      )
      jest
        .spyOn(service, 'findUserWithRole')
        .mockImplementation(mockedFindUserWithRole)

      await service.getAllUsers(UserRoles.Student, {
        notAssignedToParent: parentId,
      })

      expect(mockedFindUserWithRole).toHaveBeenCalled()
    })

    describe('errors', () => {
      it('should throw if notContainingStudents is set on admin', async () => {
        await expect(
          service.getAllUsers(UserRoles.Admin, { notContainingStudents: [] })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notContainingGroups is set on admin', async () => {
        await expect(
          service.getAllUsers(UserRoles.Admin, { notContainingGroups: [] })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToTeacher is set on admin', async () => {
        await expect(
          service.getAllUsers(UserRoles.Admin, {
            notAssignedToTeacher: teacherId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToParent is set on admin', async () => {
        await expect(
          service.getAllUsers(UserRoles.Admin, {
            notAssignedToParent: parentId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToTeacher is set on teacher', async () => {
        await expect(
          service.getAllUsers(UserRoles.Teacher, {
            notAssignedToTeacher: teacherId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToParent is set on teacher', async () => {
        await expect(
          service.getAllUsers(UserRoles.Teacher, {
            notAssignedToParent: parentId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notContainingGroups is set on parent', async () => {
        await expect(
          service.getAllUsers(UserRoles.Parent, { notContainingGroups: [] })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToTeacher is set on parent', async () => {
        await expect(
          service.getAllUsers(UserRoles.Parent, {
            notAssignedToTeacher: teacherId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notAssignedToParent is set on parent', async () => {
        await expect(
          service.getAllUsers(UserRoles.Parent, {
            notAssignedToParent: parentId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notContainingStudents is set on student', async () => {
        await expect(
          service.getAllUsers(UserRoles.Student, { notContainingStudents: [] })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if notContainingGroups is set on student', async () => {
        await expect(
          service.getAllUsers(UserRoles.Student, { notContainingGroups: [] })
        ).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('#assignGroup', () => {
    const groupId = 'groupId'
    const teacherId = 'teacherId'

    it('should throw if group not found', async () => {
      fakeGroupsService.findOneById = jest.fn().mockResolvedValue(null)

      await expect(
        service.assignGroup(teacherId, groupId, true)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw if teacher not found', async () => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(null)

      await expect(
        service.assignGroup(teacherId, groupId, true)
      ).rejects.toThrow(NotFoundException)
    })

    it('should call teacher assign group if group and teacher present', async () => {
      jest.spyOn(service, 'findUserWithRole').mockResolvedValue(true as any)

      await service.assignGroup(teacherId, groupId, true)

      expect(fakeTeachersService.assignGroup).toHaveBeenCalledWith(
        teacherId,
        groupId,
        true
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
