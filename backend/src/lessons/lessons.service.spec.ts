import { BadRequestException } from '@nestjs/common'
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

  describe('#create', () => {
    const groupId = 'groupId'
    const studentId = 'studentId'
    const teacherId = 'teacherId'
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
})
