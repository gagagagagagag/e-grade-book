import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TeacherUser, TeacherUserDocument } from './schemas'
import { TeachersService } from './teachers.service'

describe('TeachersService', () => {
  let service: TeachersService
  let fakeTeacherUserModel: Partial<Model<TeacherUserDocument>>

  beforeEach(async () => {
    fakeTeacherUserModel = {
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: getModelToken(TeacherUser.name),
          useValue: fakeTeacherUserModel,
        },
      ],
    }).compile()

    service = module.get<TeachersService>(TeachersService)
  })

  const teacherId = 'teacherId'
  const groupId = 'groupId'
  const studentId = 'studentId'

  describe('#assertGroupAssignedToTeacher', () => {
    it('should throw if teacher not found', async () => {
      await expect(
        service.assertGroupAssignedToTeacher(teacherId, studentId)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#assertUserAssignedToTeacher', () => {
    it('should throw if teacher not found', async () => {
      await expect(
        service.assertUserAssignedToTeacher(teacherId, studentId)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#assignGroup', () => {
    it('should throw an error if no object was updated', async () => {
      fakeTeacherUserModel.updateOne = jest
        .fn()
        .mockResolvedValue({ modifiedCount: 0 })

      await expect(
        service.assignGroup(teacherId, groupId, true)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#assignStudent', () => {
    it('should call updateOne with a correct query on add', async () => {
      await service.assignStudent(teacherId, studentId, true)

      expect(fakeTeacherUserModel.updateOne).toBeCalledWith(
        {
          _id: teacherId,
          students: { $ne: studentId },
        },
        { $push: { students: studentId } },
        { new: true }
      )
    })

    it('should call updateOne with a correct query on remove', async () => {
      await service.assignStudent(teacherId, studentId, false)

      expect(fakeTeacherUserModel.updateOne).toBeCalledWith(
        {
          _id: teacherId,
          students: { $eq: studentId },
        },
        { $pull: { students: studentId } },
        { new: true }
      )
    })

    it('should throw an error if no object was updated', async () => {
      fakeTeacherUserModel.updateOne = jest
        .fn()
        .mockResolvedValue({ modifiedCount: 0 })

      await expect(
        service.assignStudent(teacherId, studentId, true)
      ).rejects.toThrow(BadRequestException)
    })
  })
})
