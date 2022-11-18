import { BadRequestException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'

import { GroupsService } from '../groups/groups.service'
import { User, UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { generateTestPaginationOptions } from '../utils/stubs/pagination-options.stub'
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
      find: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(0),
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
  const parentId = 'parentId'
  const studentId = 'studentId'
  const teacherId = 'teacherId'
  const groupId = 'groupId'

  describe('#getLessons', () => {
    describe('request as admin', () => {
      const currentUser = { role: UserRoles.Admin } as unknown as User

      it('should not alter the query for an admin', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser)

        expect(fakeLessonModel.find).toBeCalledWith(
          {},
          expect.anything(),
          expect.anything()
        )
      })
    })

    describe('request as teacher', () => {
      const currentUser = {
        role: UserRoles.Teacher,
        id: teacherId,
      } as unknown as User

      it('should filter by the teacherId', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser)

        expect(fakeLessonModel.find).toBeCalledWith(
          { teacher: teacherId },
          expect.anything(),
          expect.anything()
        )
      })

      it('should not allow to change the teacher filter', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser, {
          teacher: 'anotherTeacher',
        })

        expect(fakeLessonModel.find).toBeCalledWith(
          { teacher: teacherId },
          expect.anything(),
          expect.anything()
        )
      })
    })

    describe('request as parent', () => {
      const studentId2 = 'studentId2'
      const studentId3 = 'studentId3'
      const currentUser = {
        role: UserRoles.Parent,
        id: parentId,
        students: [studentId, studentId2],
      } as unknown as User

      it('should filter participants by parents students', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser)

        expect(fakeLessonModel.find).toBeCalledWith(
          {
            'participants.student': {
              $in: [studentId, studentId2],
            },
          },
          expect.anything(),
          expect.anything()
        )
      })

      it('should intersect the filter user with parents students', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser, {
          student: studentId3,
        })

        expect(fakeLessonModel.find).toBeCalledWith(
          {
            'participants.student': {
              $in: [],
            },
          },
          expect.anything(),
          expect.anything()
        )
      })
    })

    describe('request as student', () => {
      const currentUser = {
        role: UserRoles.Student,
        id: studentId,
      } as unknown as User

      it('should filter participants by current users id', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser)

        expect(fakeLessonModel.find).toBeCalledWith(
          {
            'participants.student': studentId,
          },
          expect.anything(),
          expect.anything()
        )
      })

      it('should overwrite student filter to current user id', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await service.getLessons(paginationOptions, currentUser, {
          student: 'anotherStudent',
        })

        expect(fakeLessonModel.find).toBeCalledWith(
          {
            'participants.student': studentId,
          },
          expect.anything(),
          expect.anything()
        )
      })
    })

    describe('validation errors', () => {
      it('should throw if search term is provided', async () => {
        const paginationOptions = generateTestPaginationOptions({ q: 'test' })
        await expect(
          service.getLessons(paginationOptions, null as unknown as User)
        ).rejects.toThrow(BadRequestException)
      })

      it('should throw if both group and student filter is provided', async () => {
        const paginationOptions = generateTestPaginationOptions()
        await expect(
          service.getLessons(paginationOptions, null as unknown as User, {
            group: groupId,
            student: studentId,
          })
        ).rejects.toThrow(BadRequestException)
      })
    })
  })

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

  describe('#getLessonProjection', () => {
    it('should remove teacher for student', () => {
      const result = service.getLessonProjection(UserRoles.Student)

      expect(result).toBe('-teacher')
    })

    it('should remove teacher for parent', () => {
      const result = service.getLessonProjection(UserRoles.Parent)

      expect(result).toBe('-teacher')
    })

    it('should give empty projection for admin', () => {
      const result = service.getLessonProjection(UserRoles.Admin)

      expect(result).toBe('')
    })

    it('should give empty projection for teacher', () => {
      const result = service.getLessonProjection(UserRoles.Teacher)

      expect(result).toBe('')
    })
  })

  describe('#sanitizeLessons', () => {
    const studentId2 = 'studentId2'
    const lessons = [
      {
        participants: [
          {
            student: studentId,
          },
          {
            student: studentId2,
          },
        ],
      },
    ] as unknown as Lesson[]

    it('should not change lessons for admin', () => {
      const result = service.sanitizeLessons(lessons, {
        role: UserRoles.Admin,
      } as unknown as User)

      expect(result[0].participants.length).toEqual(2)
    })

    it('should not change lessons for teacher', () => {
      const result = service.sanitizeLessons(lessons, {
        role: UserRoles.Teacher,
      } as unknown as User)

      expect(result[0].participants.length).toEqual(2)
    })

    it('should remove other participants from user', () => {
      const result = service.sanitizeLessons(lessons, {
        role: UserRoles.Student,
        id: studentId,
      } as unknown as User)

      const participants = result[0].participants
      expect(participants.length).toEqual(1)
      expect(participants[0].student).toEqual(studentId)
    })

    it('should remove participants other that parents students', () => {
      const result = service.sanitizeLessons(lessons, {
        role: UserRoles.Parent,
        id: parentId,
        students: [studentId],
      } as unknown as User)

      const participants = result[0].participants
      expect(participants.length).toEqual(1)
      expect(participants[0].student).toEqual(studentId)
    })

    it('should intersect filtered user with parents students', () => {
      const result = service.sanitizeLessons(
        lessons,
        {
          role: UserRoles.Parent,
          id: parentId,
          students: [studentId],
        } as unknown as User,
        studentId2
      )

      const participants = result[0].participants
      expect(participants.length).toEqual(0)
    })
  })
})
