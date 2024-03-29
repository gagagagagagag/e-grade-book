import { isEqual, intersection } from 'lodash'
import { DateTime } from 'luxon'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ROLE_INVALID, LESSON_NOT_FOUND } from '../utils/validation-errors'
import { GroupsService } from '../groups/groups.service'
import { ParentUser, User, UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { PaginationOptionsDto } from '../dtos'
import { QueryBuilder } from '../utils'
import { CreateLessonDto, UpdateLessonDto } from './dtos'
import {
  Lesson,
  LessonDocument,
  LessonHomework,
  LessonPresence,
} from './lesson.schema'

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService
  ) {}

  async getLessons(
    paginationOptions: PaginationOptionsDto,
    currentUser: User,
    filters: {
      from?: string
      to?: string
      teacher?: string
      group?: string
      student?: string
    } = {}
  ) {
    const queryBuilder = new QueryBuilder()

    queryBuilder.throwErrors(
      paginationOptions.q && 'Nie można wyszukiwać lekcji',
      filters.group &&
        filters.student &&
        'Nie można filtrować lekcji po grupie i uczniu w tym samym momencie'
    )

    queryBuilder.add(
      filters.group && { group: filters.group },
      filters.student && { 'participants.student': filters.student }
    )

    if (filters.to || filters.from) {
      let dateQuery = {}

      if (filters.from) {
        dateQuery = {
          ...dateQuery,
          $gte: filters.from,
        }
      }

      if (filters.to) {
        dateQuery = {
          ...dateQuery,
          $lte: filters.to,
        }
      }

      queryBuilder.add({ date: dateQuery })
    }

    switch (currentUser.role) {
      case UserRoles.Admin:
        queryBuilder.add(filters.teacher && { teacher: filters.teacher })
        break
      case UserRoles.Teacher:
        queryBuilder.add({ teacher: currentUser.id })
        break
      case UserRoles.Parent:
        const parentUser = currentUser as ParentUser
        const studentFilter = filters.student
          ? intersection(
              parentUser.students?.map((student) => student.toString()),
              [filters.student]
            )
          : parentUser.students

        queryBuilder.add({
          'participants.student': {
            $in: studentFilter,
          },
        })
        break
      case UserRoles.Student:
        queryBuilder.add({ 'participants.student': currentUser.id })
        break
      default:
        throw new BadRequestException(ROLE_INVALID)
    }

    const data = await this.lessonModel.find(
      queryBuilder.getQuery(),
      this.getLessonProjection(currentUser.role),
      paginationOptions.createFindOptions({
        populate: [
          {
            path: 'teacher',
            select: '_id name role',
          },
          {
            path: 'group',
            select: '_id name',
          },
          {
            path: 'student',
            select: '_id name',
          },
        ],
      })
    )

    const count = await this.lessonModel.countDocuments(queryBuilder.getQuery())

    return paginationOptions.createResponse(
      this.sanitizeLessons(data, currentUser, filters.student),
      count
    )
  }

  async create(teacherId: string, data: CreateLessonDto) {
    const participantIds = data.participants.map(
      (participant) => participant.student
    )

    if (data.group && !data.student) {
      await this.usersService.assertGroupAssignedToUser(teacherId, data.group)

      await this.groupsService.assertGroupContains(data.group, participantIds)

      return this.lessonModel.create({
        teacher: teacherId,
        group: data.group,
        date: data.date,
        duration: data.duration,
        participants: data.participants,
      })
    } else if (data.student && !data.group) {
      await this.usersService.assertUsersHaveRole(
        [data.student],
        UserRoles.Student
      )

      const [studentId] = participantIds
      if (participantIds.length !== 1) {
        throw new BadRequestException(
          'Tylko jeden uczeń może zostać dodany do lekcji'
        )
      }

      if (studentId !== data.student) {
        throw new BadRequestException('Dane lekcji i ucznia nie zgadzają się')
      }

      await this.usersService.assertUserAssignedToUser(teacherId, studentId)

      return this.lessonModel.create({
        teacher: teacherId,
        student: data.student,
        date: data.date,
        duration: data.duration,
        participants: data.participants,
      })
    } else {
      throw new BadRequestException('Proszę podać ucznia lub grupę, nie oba')
    }
  }

  async update(id: string, attrs: UpdateLessonDto, currentUser: User) {
    if (currentUser.role === UserRoles.Teacher) {
      await this.assertLessonCreatedByTeacher(id, currentUser.id)
    }

    const lesson = await this.findOneById(id)

    if (!lesson) {
      throw new NotFoundException(LESSON_NOT_FOUND)
    }

    if (attrs.participants) {
      const oldParticipants = lesson.participants
        .map((participant) => participant.student.toString())
        .sort()
      const newParticipants = attrs.participants
        .map((participant) => participant.student.toString())
        .sort()

      if (!isEqual(oldParticipants, newParticipants)) {
        throw new BadRequestException('Nie można zmieniać uczestników lekcji')
      }
    }

    return this.lessonModel.findByIdAndUpdate(id, attrs, { new: true })
  }

  async delete(id: string, currentUser: User) {
    if (currentUser.role === UserRoles.Teacher) {
      await this.assertLessonCreatedByTeacher(id, currentUser.id)
    }

    const result = await this.lessonModel.findByIdAndDelete(id)

    if (!result) {
      throw new NotFoundException(LESSON_NOT_FOUND)
    }

    return result
  }

  async findOneById(id: string | null) {
    if (!id) {
      return null
    }

    return this.lessonModel.findById(id).lean().exec()
  }

  async assertLessonCreatedByTeacher(lessonId: string, teacherId: string) {
    const lesson = await this.findOneById(lessonId)

    if (!lesson) {
      throw new NotFoundException(LESSON_NOT_FOUND)
    }

    if (lesson.teacher.toString() !== teacherId) {
      throw new BadRequestException(
        'Lekcja nie była tworzona przez tego nauczyciela'
      )
    }
  }

  async getLessonStats(limitTo: {
    student?: string | null
    teacher?: string | null
    group?: string | null
  }) {
    const dateNow = DateTime.now()
    const periodStart = dateNow.minus({ days: 60 }).toJSDate()
    const periodMiddle = dateNow.minus({ days: 30 }).toJSDate()

    const queryBuilder = new QueryBuilder()

    queryBuilder.add(Boolean(limitTo.teacher) && { teacher: limitTo.teacher })
    queryBuilder.add(
      Boolean(limitTo.student) && { 'participants.student': limitTo.student }
    )
    queryBuilder.add(Boolean(limitTo.group) && { group: limitTo.group })

    const result = await this.lessonModel
      .aggregate([
        {
          $match: {
            date: { $gte: periodStart },
            ...queryBuilder.getQuery(),
          },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: {
                  $lt: ['$date', periodMiddle],
                },
                then: 'last',
                else: 'current',
              },
            },
            totalLessons: {
              $count: {},
            },
            totalDuration: {
              $sum: '$duration',
            },
            totalAttendance: {
              $sum: {
                $cond: {
                  if: { $isArray: '$participants' },
                  then: { $size: '$participants' },
                  else: 'NA',
                },
              },
            },
            totalAbsence: {
              $sum: {
                $cond: {
                  if: { $isArray: '$participants' },
                  then: {
                    $size: {
                      $filter: {
                        input: '$participants',
                        as: 'participant',
                        cond: {
                          $eq: [
                            '$$participant.presence',
                            LessonPresence.Absent,
                          ],
                        },
                      },
                    },
                  },
                  else: 'NA',
                },
              },
            },
            totalMissingHomework: {
              $sum: {
                $cond: {
                  if: { $isArray: '$participants' },
                  then: {
                    $size: {
                      $filter: {
                        input: '$participants',
                        as: 'participant',
                        cond: {
                          $and: [
                            {
                              $ne: [
                                '$$participant.presence',
                                LessonPresence.Absent,
                              ],
                            },
                            {
                              $eq: [
                                '$$participant.homework',
                                LessonHomework.NotDone,
                              ],
                            },
                          ],
                        },
                      },
                    },
                  },
                  else: 'NA',
                },
              },
            },
          },
        },
      ])
      .exec()

    return result.reduce((res, doc) => {
      res[doc._id] = { ...doc }

      return res
    }, {})
  }

  getLessonProjection(currentUserRole: UserRoles) {
    switch (currentUserRole) {
      case UserRoles.Parent:
        return '-teacher'
      case UserRoles.Student:
        return '-teacher'
      default:
        return ''
    }
  }

  sanitizeLessons(
    lessons: Lesson[],
    currentUser: User,
    studentFilter?: string
  ) {
    let students: string[] = []
    switch (currentUser.role) {
      case UserRoles.Student:
        students = [currentUser.id]
        break
      case UserRoles.Parent:
        const parentUser = currentUser as ParentUser
        students = studentFilter
          ? intersection(
              parentUser.students?.map((student) => student.toString()),
              [studentFilter]
            )
          : parentUser.students ?? []
        break
      default:
        return lessons
    }

    return lessons.map((document) => {
      document.participants = document.participants.filter((participant) =>
        students.some(
          (student) => student.toString() === participant.student.toString()
        )
      )
      return document
    })
  }
}
