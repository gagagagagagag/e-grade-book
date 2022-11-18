import { isEqual, intersection } from 'lodash'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { GroupsService } from '../groups/groups.service'
import { ParentUser, User, UserRoles } from '../users/schemas'
import { UsersService } from '../users/users.service'
import { PaginationOptionsDto } from '../dtos'
import { QueryBuilder } from '../utils'
import { CreateLessonDto, UpdateLessonDto } from './dtos'
import { Lesson, LessonDocument } from './lesson.schema'

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
      teacher?: string
      group?: string
      student?: string
    } = {}
  ) {
    const queryBuilder = new QueryBuilder()

    queryBuilder.throwErrors(
      paginationOptions.q && "You can't search lessons",
      filters.group &&
        filters.student &&
        "Can't filter by group and student at the same time"
    )

    queryBuilder.add(
      filters.group && { group: filters.group },
      filters.student && { 'participants.student': filters.student }
    )

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
          ? intersection(parentUser.students, [filters.student])
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
        throw new BadRequestException('Current user has an unknown role')
    }

    const data = await this.lessonModel.find(
      queryBuilder.getQuery(),
      this.getLessonProjection(currentUser.role),
      paginationOptions.createFindOptions()
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
          'Only one student can be attached to a lesson'
        )
      }

      if (studentId !== data.student) {
        throw new BadRequestException(
          'Provided student id and participant id do not match'
        )
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
      throw new BadRequestException(
        'Either students or group has to be provided, but not both'
      )
    }
  }

  async update(id: string, attrs: UpdateLessonDto, currentUser: User) {
    if (currentUser.role === UserRoles.Teacher) {
      await this.assertLessonCreatedByTeacher(id, currentUser.id)
    }

    const lesson = await this.findOneById(id)

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    if (attrs.participants) {
      const oldParticipants = lesson.participants
        .map((participant) => participant.student.toString())
        .sort()
      const newParticipants = attrs.participants
        .map((participant) => participant.student.toString())
        .sort()

      if (!isEqual(oldParticipants, newParticipants)) {
        throw new BadRequestException(
          "You can't change the lessons participants"
        )
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
      throw new NotFoundException('Lesson not found')
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
      throw new NotFoundException('Lesson not found')
    }

    if (lesson.teacher.toString() !== teacherId) {
      throw new BadRequestException('Lesson was not created by this teacher')
    }
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
          ? intersection(parentUser.students, [studentFilter])
          : parentUser.students
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
