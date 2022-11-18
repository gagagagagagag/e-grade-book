import { Model } from 'mongoose'
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

    const group = await this.findOneById(id)

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    return group
  }

  async getGroups(paginationOptions: PaginationOptionsDto) {
    const queryBuilder = new QueryBuilder(paginationOptions.getBaseQuery())

    const data = await this.groupModel.find(
      queryBuilder.getQuery(),
      null,
      paginationOptions.createFindOptions()
    )

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
        throw new NotFoundException('Teacher not found')
      }

      queryBuilder.add({ _id: { $nin: teacher.groups } })
    }

    return this.groupModel.find(queryBuilder.getQuery(), null, {
      lean: true,
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
      throw new NotFoundException('Group not found')
    }

    return group
  }

  async delete(id: string) {
    const result = await this.groupModel.findByIdAndDelete(id)

    if (!result) {
      throw new NotFoundException('Group not found')
    }

    return result
  }

  async assertGroupContains(groupId: string, studentIds: string[]) {
    const group = await this.groupModel.findOne({
      _id: groupId,
      students: { $all: studentIds },
    })

    if (!group) {
      throw new NotFoundException('Group does not contain the provided users')
    }
  }

  async assignStudent(groupId: string, studentId: string, add: boolean) {
    const student = await this.usersService.findUserWithRole(
      studentId,
      UserRoles.Student
    )

    if (!student) {
      throw new NotFoundException('Student not found')
    }

    const group = await this.findOneById(groupId)

    if (!group) {
      throw new NotFoundException('Group not found')
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
          ? 'User is already assigned to the group'
          : 'User is not assigned to the teacher'
      )
    }

    return true
  }
}
