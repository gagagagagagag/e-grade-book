import { Model } from 'mongoose'
import { reduce, uniq } from 'lodash'
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PaginationOptionsDto } from '../dtos'
import { UsersService } from '../users/users.service'
import { TeacherUser, User, UserRoles } from '../users/schemas'
import { QueryBuilder } from '../utils'
import { Group, GroupDocument } from './group.schema'
import { UpdateGroupDto } from './dtos'
import {
  GROUP_NOT_FOUND,
  STUDENT_NOT_FOUND,
  TEACHER_NOT_FOUND,
} from '../utils/validation-errors'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  async getGroup(id: string, currentUser: User) {
    if (currentUser.role === UserRoles.Teacher) {
      await this.usersService.assertGroupAssignedToUser(currentUser.id, id)
    }

    const group = await this.groupModel.findById(id, null, {
      populate: {
        path: 'students',
        select: '_id name role',
      },
    })

    if (!group) {
      throw new NotFoundException(GROUP_NOT_FOUND)
    }

    return group
  }

  async getGroups(paginationOptions: PaginationOptionsDto) {
    const queryBuilder = new QueryBuilder(paginationOptions.getBaseQuery())

    const data = await this.groupModel
      .find(
        queryBuilder.getQuery(),
        null,
        paginationOptions.createFindOptions({
          populate: {
            path: 'students',
            select: '_id name role',
          },
        })
      )
      .populate('students', '_id name role')

    const count = await this.groupModel.countDocuments(queryBuilder.getQuery())

    return paginationOptions.createResponse(data, count)
  }

  async getAllGroups(
    filters: {
      notContainingStudents?: string[]
      notAssignedToTeacher?: string
    } = {}
  ) {
    const queryBuilder = new QueryBuilder()

    if (filters.notContainingStudents) {
      await this.usersService.assertUsersHaveRole(
        filters.notContainingStudents,
        UserRoles.Student
      )

      queryBuilder.add({ students: { $nin: filters.notContainingStudents } })
    }

    if (filters.notAssignedToTeacher) {
      const teacher = await this.usersService.findUserWithRole<TeacherUser>(
        filters.notAssignedToTeacher,
        UserRoles.Teacher
      )

      if (!teacher) {
        throw new NotFoundException(TEACHER_NOT_FOUND)
      }

      queryBuilder.add({ _id: { $nin: teacher.groups } })
    }

    return this.groupModel.find(queryBuilder.getQuery(), null, {
      lean: true,
      populate: {
        path: 'students',
        select: '_id name role',
      },
    })
  }

  async findOneById(id: string | null) {
    if (!id) {
      return null
    }

    return this.groupModel.findById(id).exec()
  }

  async create(name: string) {
    const group = new this.groupModel({ name })

    return group.save()
  }

  async update(id: string, attrs: UpdateGroupDto) {
    if (attrs.students && attrs.students.length > 0) {
      await this.usersService.assertUsersHaveRole(
        attrs.students,
        UserRoles.Student
      )
    }

    const group = await this.groupModel.findByIdAndUpdate(id, attrs, {
      new: true,
    })

    if (!group) {
      throw new NotFoundException(GROUP_NOT_FOUND)
    }

    return group
  }

  async delete(id: string) {
    const result = await this.groupModel.findByIdAndDelete(id)

    if (!result) {
      throw new NotFoundException(GROUP_NOT_FOUND)
    }

    return result
  }

  async getUsersFromGroups(groupIds: string[]) {
    const groups = await this.groupModel.find(
      { _id: { $in: groupIds } },
      'students',
      {
        lean: true,
      }
    )

    if (groups.length !== groupIds.length) {
      throw new BadRequestException('Podano niepoprawne id grup')
    }

    return uniq(
      reduce<Group, string[]>(
        groups,
        (result, group) => {
          const groupStudents = group.students

          if (groupStudents) {
            return [
              ...result,
              ...groupStudents.map((student) => student.toString()),
            ]
          }

          return result
        },
        []
      )
    )
  }

  async assertGroupContains(groupId: string, studentIds: string[]) {
    const group = await this.groupModel.findOne({
      _id: groupId,
      students: { $all: studentIds },
    })

    if (!group) {
      throw new NotFoundException('Grupa nie zawiera podanych uczniów')
    }
  }

  async assignStudent(groupId: string, studentId: string, add: boolean) {
    const student = await this.usersService.findUserWithRole(
      studentId,
      UserRoles.Student
    )

    if (!student) {
      throw new NotFoundException(STUDENT_NOT_FOUND)
    }

    const group = await this.findOneById(groupId)

    if (!group) {
      throw new NotFoundException(GROUP_NOT_FOUND)
    }

    const result = await this.groupModel.updateOne(
      {
        _id: groupId,
        students: add ? { $ne: studentId } : { $eq: studentId },
      },
      add
        ? { $push: { students: studentId } }
        : { $pull: { students: studentId } },
      {
        new: true,
      }
    )

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        add
          ? 'Uczeń jest już przypisany do nauczyciela'
          : 'Uczeń nie jest przypisany do nauczyciela'
      )
    }

    return true
  }
}
