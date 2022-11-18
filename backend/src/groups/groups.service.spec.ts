import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { User, UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { Group, GroupDocument } from './group.schema'
import { GroupsService } from './groups.service'

describe('GroupsService', () => {
  let service: GroupsService
  let fakeGroupModel: Partial<Model<GroupDocument>>
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    fakeGroupModel = {
      find: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockResolvedValue({ id }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    }
    fakeUsersService = {
      findUserWithRole: jest.fn().mockResolvedValue({ _id: teacherId }),
      assertUsersHaveRole: jest.fn(),
      assertGroupAssignedToUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group.name),
          useValue: fakeGroupModel,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile()

    service = module.get<GroupsService>(GroupsService)
  })

  const id = 'test_id'
  const name = 'group_name'
  const studentId = 'student_id'
  const teacherId = 'teacherId'

  describe('#getGoup', () => {
    it('should check if the group is assigned to the teacher', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(true as any)

      service.getGroup(id, { role: UserRoles.Teacher } as unknown as User)

      expect(fakeUsersService.assertGroupAssignedToUser).toHaveBeenCalled()
    })

    it('should throw if the group is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null)

      await expect(
        service.getGroup(id, { role: UserRoles.Admin } as unknown as User)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('#getGroups', () => {
    // nothing to test for now
  })

  describe('#getAllGroups', () => {
    describe('notContainingStudents', () => {
      it('should check if students are students', async () => {
        await service.getAllGroups({ notContainingStudents: [studentId] })

        expect(fakeUsersService.assertUsersHaveRole).toHaveBeenCalled()
      })

      it('should not check if students are students if query not provided', async () => {
        await service.getAllGroups()

        expect(fakeUsersService.assertUsersHaveRole).not.toHaveBeenCalled()
      })
    })

    describe('notAssignedToTeacher', () => {
      it('should throw if user is not a teacher', async () => {
        fakeUsersService.findUserWithRole = jest.fn().mockResolvedValue(null)

        await expect(
          service.getAllGroups({ notAssignedToTeacher: teacherId })
        ).rejects.toThrow(NotFoundException)
      })
    })
  })

  describe('#findOneById', () => {
    it('should return null if id is null', async () => {
      const result = await service.findOneById(null)

      expect(result).toBeNull()
    })

    it('should call group model with valid id', async () => {
      await service.findOneById(id)

      expect(fakeGroupModel.findById).toHaveBeenCalledWith(id)
    })
  })

  describe('#update', () => {
    it('should throw if the group with that id is not found', async () => {
      fakeGroupModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

      await expect(service.update(id, { name })).rejects.toThrow(
        NotFoundException
      )
    })

    it('should check if all students are students if they are provided', async () => {
      await service.update(id, { students: [studentId] })

      expect(fakeUsersService.assertUsersHaveRole).toHaveBeenCalled()
    })
  })

  describe('#delete', () => {
    it('should throw if group not found', async () => {
      fakeGroupModel.findByIdAndDelete = jest.fn().mockResolvedValue(null)

      await expect(service.delete(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('#getUsersFromGroups', () => {
    const studentId2 = 'studentId2'
    const studentId3 = 'studentId3'
    const groups = [
      {
        students: [studentId, studentId3],
      },
      {},
      { students: [studentId2, studentId3] },
    ]

    it('should throw if not all ids are group ids', async () => {
      fakeGroupModel.find = jest.fn().mockResolvedValue([])

      await expect(service.getUsersFromGroups([id])).rejects.toThrow(
        BadRequestException
      )
    })

    it('should extract ids and remove duplicates', async () => {
      fakeGroupModel.find = jest.fn().mockResolvedValue(groups)

      const result = await service.getUsersFromGroups([id, id, id])

      expect(result).toEqual(
        expect.arrayContaining([studentId, studentId2, studentId3])
      )
    })
  })

  describe('#assignStudent', () => {
    it('should throw if student is not a student', async () => {
      fakeUsersService.findUserWithRole = jest.fn().mockResolvedValue(null)

      await expect(service.assignStudent(id, studentId, true)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should throw if group is not a group', async () => {
      fakeGroupModel.findById = jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve(null) })

      await expect(service.assignStudent(id, studentId, true)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should throw if nothing was updated', async () => {
      fakeGroupModel.findById = jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve({ id }) })
      fakeGroupModel.updateOne = jest
        .fn()
        .mockResolvedValue({ modifiedCount: 0 })

      await expect(service.assignStudent(id, studentId, true)).rejects.toThrow(
        BadRequestException
      )
    })
  })
})
