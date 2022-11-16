import { BadRequestException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { ParentsService } from './parents.service'
import { ParentUser, ParentUserDocument } from './schemas'

describe('ParentsService', () => {
  let service: ParentsService
  let fakeParentUserModel: Partial<Model<ParentUserDocument>>

  beforeEach(async () => {
    fakeParentUserModel = {
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        {
          provide: getModelToken(ParentUser.name),
          useValue: fakeParentUserModel,
        },
      ],
    }).compile()

    service = module.get<ParentsService>(ParentsService)
  })

  describe('#assignStudent', () => {
    const parentId = 'parentId'
    const studentId = 'studentId'

    it('should call updateOne with a correct query on add', async () => {
      await service.assignStudent(parentId, studentId, true)

      expect(fakeParentUserModel.updateOne).toBeCalledWith(
        {
          id: parentId,
          students: { $ne: studentId },
        },
        { $push: { students: studentId } },
        { new: true }
      )
    })

    it('should call updateOne with a correct query on remove', async () => {
      await service.assignStudent(parentId, studentId, false)

      expect(fakeParentUserModel.updateOne).toBeCalledWith(
        {
          id: parentId,
          students: { $eq: studentId },
        },
        { $pull: { students: studentId } },
        { new: true }
      )
    })

    it('should throw an error if no object was updated', async () => {
      fakeParentUserModel.updateOne = jest
        .fn()
        .mockResolvedValue({ modifiedCount: 0 })

      await expect(
        service.assignStudent(parentId, studentId, true)
      ).rejects.toThrow(BadRequestException)
    })
  })
})
