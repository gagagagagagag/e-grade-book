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

  describe('#assignStudent', () => {
    const teacherId = 'teacherId'
    const studentId = 'studentId'

    it('should call updateOne with a correct query on add', async () => {
      await service.assignStudent(teacherId, studentId, true)

      expect(fakeTeacherUserModel.updateOne).toBeCalledWith(
        {
          id: teacherId,
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
          id: teacherId,
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
