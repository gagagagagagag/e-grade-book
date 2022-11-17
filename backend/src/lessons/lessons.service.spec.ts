import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { GroupsService } from '../groups/groups.service'
import { UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import {
  Lesson,
  LessonDocument,
  LessonHomework,
  LessonPresence,
} from './lesson.schema'
import { LessonsService } from './lessons.service'

describe('LessonsService', () => {
  let service: LessonsService
  let fakeLessonModel: Partial<Model<LessonDocument>>
  let fakeUsersService: Partial<UsersService>
  let fakeGroupsService: Partial<GroupsService>

  beforeEach(async () => {
    fakeLessonModel = {
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn().mockResolvedValue(true),
    }
    fakeGroupsService = {
      assertGroupContains: jest.fn(),
    }
    fakeUsersService = {
      assertGroupAssignedToUser: jest.fn(),
      assertUsersHaveRole: jest.fn(),
      assertUserAssignedToUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Lesson.name),
          useValue: fakeLessonModel,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: GroupsService,
          useValue: fakeGroupsService,
        },
        LessonsService,
      ],
    }).compile()

    service = module.get<LessonsService>(LessonsService)
  })

  const lessonId = 'lessonId'
  const studentId = 'studentId'
  const teacherId = 'teacherId'
  const groupId = 'groupId'

  describe('#create', () => {
    const participants = [
      {
        student: studentId,
        homework: LessonHomework.Done,
        presence: LessonPresence.Present,
      },
    ]
    const data = { date: new Date('2022-11-16T23:12:54.971Z'), duration: 100 }

    describe('group provided', () => {
      beforeEach(async () => {
        await service.create(teacherId, {
          ...data,
          participants,
          group: groupId,
        })
      })

      it('should check if the group is assigned to the teacher', () => {
        expect(fakeUsersService.assertGroupAssignedToUser).toHaveBeenCalled()
      })

      it('should check if group contains the participants', () => {
        expect(fakeGroupsService.assertGroupContains).toHaveBeenCalled()
        expect(fakeGroupsService.assertGroupContains).toHaveBeenCalledWith(
          groupId,
          [studentId]
        )
      })

      it('should create a lesson', () => {
        expect(fakeLessonModel.create).toHaveBeenCalled()
      })
    })

    describe('student provided', () => {
      it('should check if the user is a student', async () => {
        await service.create(teacherId, {
          ...data,
          participants,
          student: studentId,
        })

        expect(fakeUsersService.assertUsersHaveRole).toHaveBeenCalledWith(
          [studentId],
          UserRoles.Student
        )
      })

      it('should check if the user is assigned to the teacher', async () => {
        await service.create(teacherId, {
          ...data,
          participants,
          student: studentId,
        })

        expect(fakeUsersService.assertUserAssignedToUser).toHaveBeenCalledWith(
          teacherId,
          studentId
        )
      })

      it('should create the lesson', async () => {
        await service.create(teacherId, {
          ...data,
          participants,
          student: studentId,
        })

        expect(fakeLessonModel.create).toHaveBeenCalled()
      })

      it('should throw if there are more than 1 participant', async () => {
        await expect(
          service.create(teacherId, {
            ...data,
            participants: [...participants, ...participants],
            student: studentId,
          })
        ).rejects.toThrow(BadRequestException)
      })

      it("should throw if student doesn't match the participant", async () => {
        await expect(
          service.create(teacherId, {
            ...data,
            participants,
            student: 'other_student',
          })
        ).rejects.toThrow(BadRequestException)
      })
    })

    describe('other', () => {
      it('should throw error if neither student nor group is provided', async () => {
        await expect(
          service.create(teacherId, { ...data, participants: [] })
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if both student and group is provided', async () => {
        await expect(
          service.create(teacherId, {
            ...data,
            participants: [],
            student: studentId,
            group: groupId,
          })
        ).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('#update', () => {
    it('should check if the teacher is editing his own lesson', async () => {
      const mockedAssert = jest.fn()
      jest
        .spyOn(service, 'assertLessonCreatedByTeacher')
        .mockImplementation(mockedAssert)
      jest.spyOn(service, 'findOneById').mockResolvedValue(true as any)

      await service.update(lessonId, { duration: 10 }, {
        role: UserRoles.Teacher,
      } as any)

      expect(mockedAssert).toHaveBeenCalled()
    })

    it('should not check ownership for admin', async () => {
      const mockedAssert = jest.fn()
      jest
        .spyOn(service, 'assertLessonCreatedByTeacher')
        .mockImplementation(mockedAssert)
      jest.spyOn(service, 'findOneById').mockResolvedValue(true as any)

      await service.update(lessonId, { duration: 10 }, {
        role: UserRoles.Admin,
      } as any)

      expect(mockedAssert).not.toHaveBeenCalled()
    })

    it('should throw if the lesson is not found', async () => {
      jest.spyOn(service, 'assertLessonCreatedByTeacher').mockResolvedValue()
      jest.spyOn(service, 'findOneById').mockResolvedValue(null)

      await expect(
        service.update(lessonId, { duration: 10 }, {
          role: UserRoles.Admin,
        } as any)
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw if old participants don't match new participants", async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        participants: [{ student: 'different_student' }],
      } as any)

      await expect(
        service.update(
          lessonId,
          { participants: [{ student: studentId }] } as any,
          { role: UserRoles.Admin } as any
        )
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('#delete', () => {
    const mockedAssert = jest.fn()
    beforeEach(() => {
      mockedAssert.mockReset()
      jest
        .spyOn(service, 'assertLessonCreatedByTeacher')
        .mockImplementation(mockedAssert)
    })

    it('should check if the teacher is allowed to delete', async () => {
      await service.delete(lessonId, { role: UserRoles.Teacher } as any)

      expect(mockedAssert).toHaveBeenCalled()
    })

    it('should not check ownership for admin', async () => {
      await service.delete(lessonId, { role: UserRoles.Admin } as any)

      expect(mockedAssert).not.toBeCalled()
    })

    it('should throw if lesson not found', async () => {
      fakeLessonModel.findByIdAndDelete = jest.fn().mockResolvedValue(null)

      await expect(
        service.delete(lessonId, { role: UserRoles.Admin } as any)
      ).rejects.toThrow(NotFoundException)
    })

    it('should return the deleted lesson', async () => {
      fakeLessonModel.findByIdAndDelete = jest.fn().mockResolvedValue('result')

      const result = await service.delete(lessonId, {
        role: UserRoles.Admin,
      } as any)

      expect(result).toBe('result')
    })
  })

  describe('#findOneById', () => {
    it('should return null if id is null', async () => {
      const result = await service.findOneById(null)

      expect(result).toBeNull()
    })
  })

  describe('#assertLessonCreatedByTeacher', () => {
    it('should throw if the lesson is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null)

      await expect(
        service.assertLessonCreatedByTeacher(lessonId, teacherId)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw if the teacher is not the author', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ teacher: 'anotherTeacherId' } as any)

      await expect(
        service.assertLessonCreatedByTeacher(lessonId, teacherId)
      ).rejects.toThrow(BadRequestException)
    })

    it('should not throw if the teacher is the author', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue({ teacher: teacherId } as any)

      await expect(
        service.assertLessonCreatedByTeacher(lessonId, teacherId)
      ).resolves.toBeUndefined()
    })
  })
})
